#Requires -Version 7.0
<#
.SYNOPSIS
  Pull and run the prebuilt Print Template Designer frontend image.

.DESCRIPTION
  The image is built by GitHub Actions and published to GHCR. This script never
  builds source code on the server.
#>
[CmdletBinding(DefaultParameterSetName = 'Deploy')]
param(
  [Parameter(ParameterSetName = 'Status')]
  [switch]$Status,

  [Parameter(ParameterSetName = 'Logs')]
  [switch]$Logs,

  [Parameter(ParameterSetName = 'Down')]
  [switch]$Down
)

$ErrorActionPreference = 'Stop'
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

$ServiceName = 'web'

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
  if ($processValue) {
    return $processValue
  }

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

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Stop-WithError 'Docker is not installed: https://docs.docker.com/engine/install/'
}

& docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
  Stop-WithError "Docker Compose v2 is required (the 'docker compose' command)."
}

if ($Status) {
  Invoke-Docker @('compose', 'ps')
  exit 0
}

if ($Logs) {
  Invoke-Docker @('compose', 'logs', '-f', $ServiceName)
  exit 0
}

if ($Down) {
  Write-Step 'Stopping the frontend…'
  Invoke-Docker @('compose', 'down', '--remove-orphans')
  exit 0
}

if (-not (Test-Path -LiteralPath '.env')) {
  if (-not (Test-Path -LiteralPath '.env.example')) {
    Stop-WithError 'Missing .env and .env.example.'
  }
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
  Write-WarnStep 'Created .env from .env.example. Review it before production use.'
}

$ghcrUsername = Get-ConfigValue 'GHCR_USERNAME'
$ghcrToken = Get-ConfigValue 'GHCR_TOKEN'
if ($ghcrUsername -or $ghcrToken) {
  if (-not $ghcrUsername -or -not $ghcrToken) {
    Stop-WithError 'GHCR_USERNAME and GHCR_TOKEN must be provided together.'
  }
  Write-Step "Logging in to GHCR as ${ghcrUsername}…"
  $ghcrToken | & docker login ghcr.io --username $ghcrUsername --password-stdin *> $null
  if ($LASTEXITCODE -ne 0) {
    Stop-WithError 'GHCR login failed.'
  }
}

$imageRepository = Get-ConfigValue 'IMAGE_REPOSITORY' 'ghcr.io/royians/print-template-designer-web'
$imageTag = Get-ConfigValue 'IMAGE_TAG' 'latest'
$webPort = Get-ConfigValue 'WEB_PORT' '8080'

Write-Step "Pulling ${imageRepository}:${imageTag}…"
Invoke-Docker @('compose', 'pull', $ServiceName)

Write-Step 'Recreating the frontend without a local build…'
Invoke-Docker @(
  'compose', 'up', '-d', '--no-build', '--force-recreate', '--remove-orphans', $ServiceName
)

Write-Step 'Waiting for /healthz…'
$containerIdOutput = & docker compose ps -q $ServiceName
if ($LASTEXITCODE -ne 0) {
  Stop-WithError 'Could not inspect the frontend container.'
}
$containerId = [string]($containerIdOutput | Select-Object -First 1)
$containerId = $containerId.Trim()
if (-not $containerId) {
  Stop-WithError 'The frontend container was not created.'
}

$deadline = (Get-Date).AddMinutes(2)
$health = ''
while ((Get-Date) -lt $deadline) {
  $healthOutput = & docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' $containerId 2>$null
  if ($LASTEXITCODE -ne 0) {
    Stop-WithError 'Could not inspect the frontend health status.'
  }
  $health = ([string]$healthOutput).Trim()
  if ($health -eq 'healthy') { break }
  if ($health -in @('unhealthy', 'exited', 'dead')) {
    Invoke-Docker @('compose', 'ps')
    Invoke-Docker @('compose', 'logs', '--tail=100', $ServiceName)
    Stop-WithError "Frontend health check failed with status: $health"
  }
  Start-Sleep -Seconds 2
}

if ($health -ne 'healthy') {
  Invoke-Docker @('compose', 'ps')
  Invoke-Docker @('compose', 'logs', '--tail=100', $ServiceName)
  Stop-WithError 'Timed out waiting for the frontend health check.'
}

Write-Host ''
Write-Step 'Print Template Designer is ready.'
Write-Host "  URL: http://localhost:${webPort}/"
Write-Host "  Image: ${imageRepository}:${imageTag}"
Write-Host ''
Write-Host 'Useful commands:'
Write-Host '  .\deploy.ps1 -Status'
Write-Host '  .\deploy.ps1 -Logs'
Write-Host '  .\deploy.ps1 -Down'
