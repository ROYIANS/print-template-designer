#Requires -Version 7.0
<#
.SYNOPSIS
  Complete self-hosted deployment for Foliq.

.DESCRIPTION
  Pulls prebuilt Web/Server images from GHCR by default, starts PostgreSQL,
  applies committed Prisma migrations, recreates the application and waits for
  every long-running service to become healthy. Re-running keeps database data.
#>
[CmdletBinding(DefaultParameterSetName = 'Deploy')]
param(
  [Parameter(ParameterSetName = 'Deploy')]
  [switch]$Build,

  [Parameter(ParameterSetName = 'Deploy')]
  [switch]$Fresh,

  [Parameter(ParameterSetName = 'Deploy')]
  [switch]$Yes,

  [Parameter(Mandatory, ParameterSetName = 'Status')]
  [switch]$Status,

  [Parameter(Mandatory, ParameterSetName = 'Logs')]
  [switch]$Logs,

  [Parameter(Mandatory, ParameterSetName = 'Down')]
  [switch]$Down
)

$ErrorActionPreference = 'Stop'
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

function Write-Step([string]$Message) {
  Write-Host "▸ $Message" -ForegroundColor Green
}

function Write-WarnStep([string]$Message) {
  Write-Host "▸ $Message" -ForegroundColor Yellow
}

function Stop-WithError([string]$Message) {
  Write-Host "✗ $Message" -ForegroundColor Red
  exit 1
}

function Invoke-Docker([string[]]$Arguments) {
  & docker @Arguments
  if ($LASTEXITCODE -ne 0) {
    Stop-WithError "docker $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Get-ConfigValue([string]$Key, [string]$DefaultValue = '') {
  $processValue = [Environment]::GetEnvironmentVariable($Key, 'Process')
  if ($processValue) { return $processValue }

  if (Test-Path -LiteralPath '.env') {
    foreach ($line in Get-Content -LiteralPath '.env') {
      if ($line -match '^\s*#' -or -not $line.Trim()) { continue }
      if ($line -match "^\s*$([Regex]::Escape($Key))\s*=(.*)$") {
        return $Matches[1].Trim().Trim('"').Trim("'")
      }
    }
  }

  return $DefaultValue
}

function Assert-RequiredValue([string]$Key) {
  $value = Get-ConfigValue $Key
  if (-not $value) { Stop-WithError "$Key is required in .env or the process environment." }
  $upper = $value.ToUpperInvariant()
  if ($upper.Contains('CHANGE_ME') -or $upper.Contains('REPLACE_ME')) {
    Stop-WithError "$Key still contains a placeholder; set a real deployment value."
  }
}

function Test-DeploymentConfig {
  foreach ($key in @(
    'POSTGRES_PASSWORD',
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
    'PTD_WEB_ORIGIN',
    'PTD_ALLOWED_EMAILS',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  )) {
    Assert-RequiredValue $key
  }

  $postgresUser = Get-ConfigValue 'POSTGRES_USER' 'ptd'
  $postgresDb = Get-ConfigValue 'POSTGRES_DB' 'ptd'
  foreach ($entry in @(
    @{ Key = 'POSTGRES_USER'; Value = $postgresUser },
    @{ Key = 'POSTGRES_DB'; Value = $postgresDb }
  )) {
    if ($entry.Value -notmatch '^[A-Za-z0-9_][A-Za-z0-9_.-]*$') {
      Stop-WithError "$($entry.Key) contains characters that are unsafe in DATABASE_URL."
    }
  }

  $postgresPassword = Get-ConfigValue 'POSTGRES_PASSWORD'
  if ($postgresPassword -notmatch '^[A-Za-z0-9._~-]{16,}$') {
    Stop-WithError 'POSTGRES_PASSWORD must be at least 16 URL-safe characters: A-Z a-z 0-9 . _ ~ -'
  }

  $authSecret = Get-ConfigValue 'BETTER_AUTH_SECRET'
  if ($authSecret.Length -lt 32) {
    Stop-WithError 'BETTER_AUTH_SECRET must be at least 32 characters.'
  }

  foreach ($key in @('BETTER_AUTH_URL', 'PTD_WEB_ORIGIN')) {
    $value = Get-ConfigValue $key
    if ($value -notmatch '^https?://[^/?#]+/?$') {
      Stop-WithError "$key must be an HTTP(S) origin without a path."
    }
  }

  $allowedEmails = Get-ConfigValue 'PTD_ALLOWED_EMAILS'
  if ($allowedEmails -notmatch '@.+\.') {
    Stop-WithError 'PTD_ALLOWED_EMAILS must contain at least one email address.'
  }

  & docker compose --env-file .env config --quiet
  if ($LASTEXITCODE -ne 0) { Stop-WithError 'docker-compose.yml or .env is invalid.' }
}

function Show-FailureContext {
  & docker compose ps -a
  & docker compose logs --tail=120 postgres migrate server web
}

function Wait-ServiceHealth([string]$Service, [int]$TimeoutSeconds) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $containerIdOutput = & docker compose ps -q $Service 2>$null
    $containerId = [string]($containerIdOutput | Select-Object -First 1)
    $containerId = $containerId.Trim()
    if ($containerId) {
      $state = ([string](& docker inspect --format '{{.State.Status}}' $containerId 2>$null)).Trim()
      $health = ([string](& docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{end}}' $containerId 2>$null)).Trim()
      if ($state -eq 'running' -and $health -eq 'healthy') { return }
      if ($state -in @('exited', 'dead') -or $health -eq 'unhealthy') {
        Show-FailureContext
        Stop-WithError "$Service failed while waiting for health (state=$state, health=$health)."
      }
    }
    Start-Sleep -Seconds 2
  }

  Show-FailureContext
  Stop-WithError "Timed out waiting ${TimeoutSeconds}s for $Service to become healthy."
}

function Wait-Migration {
  $deadline = (Get-Date).AddMinutes(3)
  while ((Get-Date) -lt $deadline) {
    $containerIdOutput = & docker compose ps -a -q migrate 2>$null
    $containerId = [string]($containerIdOutput | Select-Object -First 1)
    $containerId = $containerId.Trim()
    if ($containerId) {
      $state = ([string](& docker inspect --format '{{.State.Status}}' $containerId 2>$null)).Trim()
      if ($state -eq 'exited') {
        $exitCode = ([string](& docker inspect --format '{{.State.ExitCode}}' $containerId)).Trim()
        if ($exitCode -eq '0') { return }
        Show-FailureContext
        Stop-WithError "Database migration failed with exit code $exitCode."
      }
      if ($state -eq 'dead') {
        Show-FailureContext
        Stop-WithError 'Database migration container died.'
      }
    }
    Start-Sleep -Seconds 2
  }

  Show-FailureContext
  Stop-WithError 'Timed out waiting for the database migration.'
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Stop-WithError 'Docker is not installed: https://docs.docker.com/engine/install/'
}

& docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
  Stop-WithError "Docker Compose v2 is required (the 'docker compose' command)."
}

if (-not (Test-Path -LiteralPath '.env')) {
  if (-not (Test-Path -LiteralPath '.env.example')) {
    Stop-WithError 'Missing .env and .env.example.'
  }
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
  Write-WarnStep 'Created .env from .env.example.'
  Stop-WithError 'Edit every CHANGE_ME value in .env, then run the deploy command again.'
}

Test-DeploymentConfig

if ($Status) {
  Invoke-Docker @('compose', 'ps', '-a')
  exit 0
}

if ($Logs) {
  Invoke-Docker @('compose', 'logs', '-f', 'postgres', 'migrate', 'server', 'web')
  exit 0
}

if ($Down) {
  Write-Step 'Stopping Foliq containers and keeping PostgreSQL data…'
  Invoke-Docker @('compose', 'down', '--remove-orphans')
  exit 0
}

if ($Yes -and -not $Fresh) {
  Stop-WithError '-Yes is only valid together with -Fresh.'
}

if ($Fresh) {
  if (-not $Yes) {
    Write-WarnStep 'This permanently deletes the PostgreSQL volume and every Foliq user/template.'
    $answer = Read-Host 'Type WIPE_PTD_DATA to continue'
    if ($answer -ne 'WIPE_PTD_DATA') { Stop-WithError 'Fresh deployment cancelled.' }
  }
  Write-WarnStep 'Removing Foliq containers and PostgreSQL volume…'
  Invoke-Docker @('compose', 'down', '--volumes', '--remove-orphans')
}

if ($Build) {
  Write-Step 'Building Web and Server images locally…'
  Invoke-Docker @('compose', 'build', 'server', 'web')
} else {
  $ghcrUsername = Get-ConfigValue 'GHCR_USERNAME'
  $ghcrToken = Get-ConfigValue 'GHCR_TOKEN'
  if ($ghcrUsername -or $ghcrToken) {
    if (-not $ghcrUsername -or -not $ghcrToken) {
      Stop-WithError 'GHCR_USERNAME and GHCR_TOKEN must be provided together.'
    }
    Write-Step "Logging in to GHCR as ${ghcrUsername}…"
    $ghcrToken | & docker login ghcr.io --username $ghcrUsername --password-stdin *> $null
    if ($LASTEXITCODE -ne 0) { Stop-WithError 'GHCR login failed.' }
  }

  Write-Step 'Pulling PostgreSQL, Server and Web images…'
  Invoke-Docker @('compose', 'pull', 'postgres', 'server', 'web')
}

Write-Step 'Starting PostgreSQL, applying migrations and recreating the application…'
if ($Build) {
  & docker compose up -d --force-recreate --remove-orphans
} else {
  & docker compose up -d --no-build --force-recreate --remove-orphans
}
if ($LASTEXITCODE -ne 0) {
  Show-FailureContext
  Stop-WithError 'docker compose up failed.'
}

Write-Step 'Waiting for PostgreSQL…'
Wait-ServiceHealth 'postgres' 120
Write-Step 'Waiting for Prisma migration…'
Wait-Migration
Write-Step 'Waiting for Server…'
Wait-ServiceHealth 'server' 180
Write-Step 'Waiting for Web…'
Wait-ServiceHealth 'web' 120

$webOrigin = (Get-ConfigValue 'PTD_WEB_ORIGIN').TrimEnd('/')
$authUrl = (Get-ConfigValue 'BETTER_AUTH_URL').TrimEnd('/')
$imageTag = Get-ConfigValue 'IMAGE_TAG' 'latest'

Write-Host ''
Write-Step 'Foliq is ready.'
Write-Host "  Web: ${webOrigin}/"
Write-Host "  Health: ${webOrigin}/healthz"
Write-Host "  GitHub callback: ${authUrl}/api/auth/callback/github"
Write-Host "  Image tag: $imageTag"
Write-Host ''
Write-Host 'Useful commands:'
Write-Host '  .\deploy.ps1 -Status'
Write-Host '  .\deploy.ps1 -Logs'
Write-Host '  .\deploy.ps1 -Down'
Write-Host "  `$env:IMAGE_TAG='sha-<full-commit-sha>'; .\deploy.ps1  # deploy/rollback"
