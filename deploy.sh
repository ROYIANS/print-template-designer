#!/usr/bin/env bash
# One-click self-hosted deployment for Foliq.
# Default: pull prebuilt GHCR images, run migrations and recreate the stack.
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

info() { printf '\033[32m▸\033[0m %s\n' "$*"; }
warn() { printf '\033[33m▸\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

show_help() {
  cat <<'EOF'
Usage: ./deploy.sh [options]

  (default)  Pull Web/Server images, migrate and recreate the stack (DB kept)
  --build    Build Web/Server images locally instead of pulling from GHCR
  --fresh    Delete the PostgreSQL volume before deploying (confirmation required)
  --yes      Confirm --fresh non-interactively; invalid without --fresh
  --status   Show all service and image status
  --logs     Follow logs for the complete stack
  --down     Stop and remove containers while keeping the PostgreSQL volume
  -h, --help Show this help

Examples:
  ./deploy.sh
  IMAGE_TAG=sha-<full-commit-sha> ./deploy.sh
  ./deploy.sh --build
  ./deploy.sh --fresh                 # asks you to type WIPE_PTD_DATA
  ./deploy.sh --fresh --yes           # automation-only destructive form
EOF
}

read_env_value() {
  local key="$1"
  local line value

  if [[ -n "${!key-}" ]]; then
    printf '%s' "${!key}"
    return
  fi

  [[ -f .env ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[[:space:]]*${key}[[:space:]]*=(.*)$ ]]; then
      value="${BASH_REMATCH[1]}"
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"
      if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
      fi
      printf '%s' "$value"
      return
    fi
  done < .env
}

require_docker() {
  command -v docker >/dev/null 2>&1 \
    || fail "Docker is not installed: https://docs.docker.com/engine/install/"
  docker compose version >/dev/null 2>&1 \
    || fail "Docker Compose v2 is required (the 'docker compose' command)."
}

ensure_env_file() {
  if [[ ! -f .env ]]; then
    [[ -f .env.example ]] || fail "Missing .env and .env.example."
    cp .env.example .env
    warn "Created .env from .env.example."
    fail "Edit every CHANGE_ME value in .env, then run the deploy command again."
  fi
}

require_value() {
  local key="$1"
  local value normalized
  value="$(read_env_value "$key")"
  [[ -n "$value" ]] || fail "$key is required in .env or the process environment."
  normalized="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
  if [[ "$normalized" == *change_me* || "$normalized" == *replace_me* ]]; then
    fail "$key still contains a placeholder; set a real deployment value."
  fi
}

validate_config() {
  local postgres_user postgres_password postgres_db auth_secret auth_url web_origin allowed_emails

  require_value POSTGRES_PASSWORD
  require_value BETTER_AUTH_URL
  require_value BETTER_AUTH_SECRET
  require_value PTD_WEB_ORIGIN
  require_value PTD_ALLOWED_EMAILS
  require_value GITHUB_CLIENT_ID
  require_value GITHUB_CLIENT_SECRET

  postgres_user="$(read_env_value POSTGRES_USER)"
  postgres_user="${postgres_user:-ptd}"
  postgres_db="$(read_env_value POSTGRES_DB)"
  postgres_db="${postgres_db:-ptd}"
  [[ "$postgres_user" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]] \
    || fail "POSTGRES_USER contains characters that are unsafe in DATABASE_URL."
  [[ "$postgres_db" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]] \
    || fail "POSTGRES_DB contains characters that are unsafe in DATABASE_URL."

  postgres_password="$(read_env_value POSTGRES_PASSWORD)"
  [[ "$postgres_password" =~ ^[A-Za-z0-9._~-]{16,}$ ]] \
    || fail "POSTGRES_PASSWORD must be at least 16 URL-safe characters: A-Z a-z 0-9 . _ ~ -"

  auth_secret="$(read_env_value BETTER_AUTH_SECRET)"
  (( ${#auth_secret} >= 32 )) || fail "BETTER_AUTH_SECRET must be at least 32 characters."

  auth_url="$(read_env_value BETTER_AUTH_URL)"
  web_origin="$(read_env_value PTD_WEB_ORIGIN)"
  [[ "$auth_url" =~ ^https?://[^/?#]+/?$ ]] \
    || fail "BETTER_AUTH_URL must be an HTTP(S) origin without a path."
  [[ "$web_origin" =~ ^https?://[^/?#]+/?$ ]] \
    || fail "PTD_WEB_ORIGIN must be an HTTP(S) origin without a path."

  allowed_emails="$(read_env_value PTD_ALLOWED_EMAILS)"
  [[ "$allowed_emails" == *@*.* ]] \
    || fail "PTD_ALLOWED_EMAILS must contain at least one email address."

  docker compose --env-file .env config --quiet \
    || fail "docker-compose.yml or .env is invalid."
}

login_ghcr_if_configured() {
  local username token
  username="$(read_env_value GHCR_USERNAME)"
  token="$(read_env_value GHCR_TOKEN)"
  if [[ -z "$username" && -z "$token" ]]; then
    return
  fi
  [[ -n "$username" && -n "$token" ]] \
    || fail "GHCR_USERNAME and GHCR_TOKEN must be provided together."
  info "Logging in to GHCR as ${username}…"
  printf '%s' "$token" \
    | docker login ghcr.io --username "$username" --password-stdin >/dev/null
}

print_failure_context() {
  docker compose ps -a || true
  docker compose logs --tail=120 postgres migrate server web || true
}

wait_for_health() {
  local service="$1"
  local timeout_seconds="$2"
  local deadline=$((SECONDS + timeout_seconds))
  local container_id state health

  while (( SECONDS < deadline )); do
    container_id="$(docker compose ps -q "$service" 2>/dev/null || true)"
    if [[ -n "$container_id" ]]; then
      state="$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)"
      health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$container_id" 2>/dev/null || true)"
      if [[ "$state" == "running" && "$health" == "healthy" ]]; then
        return 0
      fi
      if [[ "$state" == "exited" || "$state" == "dead" || "$health" == "unhealthy" ]]; then
        print_failure_context
        fail "$service failed while waiting for health (state=${state:-unknown}, health=${health:-none})."
      fi
    fi
    sleep 2
  done

  print_failure_context
  fail "Timed out waiting ${timeout_seconds}s for $service to become healthy."
}

wait_for_migration() {
  local deadline=$((SECONDS + 180))
  local container_id state exit_code

  while (( SECONDS < deadline )); do
    container_id="$(docker compose ps -a -q migrate 2>/dev/null || true)"
    if [[ -n "$container_id" ]]; then
      state="$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)"
      if [[ "$state" == "exited" ]]; then
        exit_code="$(docker inspect --format '{{.State.ExitCode}}' "$container_id")"
        if [[ "$exit_code" == "0" ]]; then
          return 0
        fi
        print_failure_context
        fail "Database migration failed with exit code $exit_code."
      fi
      if [[ "$state" == "dead" ]]; then
        print_failure_context
        fail "Database migration container died."
      fi
    fi
    sleep 2
  done

  print_failure_context
  fail "Timed out waiting for the database migration."
}

confirm_fresh() {
  local answer
  if (( ASSUME_YES == 1 )); then
    return
  fi
  [[ -t 0 ]] || fail "--fresh requires an interactive confirmation or the additional --yes flag."
  warn "This permanently deletes the PostgreSQL volume and every Foliq user/template."
  read -r -p "Type WIPE_PTD_DATA to continue: " answer
  [[ "$answer" == "WIPE_PTD_DATA" ]] || fail "Fresh deployment cancelled."
}

ACTION="deploy"
BUILD_LOCAL=0
FRESH=0
ASSUME_YES=0

for arg in "$@"; do
  case "$arg" in
    --build) BUILD_LOCAL=1 ;;
    --fresh) FRESH=1 ;;
    --yes) ASSUME_YES=1 ;;
    --status|--logs|--down)
      [[ "$ACTION" == "deploy" ]] || fail "Only one of --status, --logs or --down may be used."
      ACTION="${arg#--}"
      ;;
    -h|--help) show_help; exit 0 ;;
    *) show_help; fail "Unknown option: $arg" ;;
  esac
done

if [[ "$ACTION" != "deploy" && ( "$BUILD_LOCAL" -eq 1 || "$FRESH" -eq 1 || "$ASSUME_YES" -eq 1 ) ]]; then
  fail "--build, --fresh and --yes are only valid for deployment."
fi
if (( ASSUME_YES == 1 && FRESH == 0 )); then
  fail "--yes is only valid together with --fresh."
fi

require_docker
ensure_env_file
validate_config

case "$ACTION" in
  status)
    docker compose ps -a
    exit 0
    ;;
  logs)
    docker compose logs -f postgres migrate server web
    exit 0
    ;;
  down)
    info "Stopping Foliq containers and keeping PostgreSQL data…"
    docker compose down --remove-orphans
    exit 0
    ;;
esac

if (( FRESH == 1 )); then
  confirm_fresh
  warn "Removing Foliq containers and PostgreSQL volume…"
  docker compose down --volumes --remove-orphans
fi

if (( BUILD_LOCAL == 1 )); then
  info "Building Web and Server images locally…"
  docker compose build server web
else
  login_ghcr_if_configured
  info "Pulling PostgreSQL, Server and Web images…"
  docker compose pull postgres server web
fi

info "Starting PostgreSQL, applying migrations and recreating the application…"
if (( BUILD_LOCAL == 1 )); then
  if ! docker compose up -d --force-recreate --remove-orphans; then
    print_failure_context
    fail "docker compose up failed."
  fi
else
  if ! docker compose up -d --no-build --force-recreate --remove-orphans; then
    print_failure_context
    fail "docker compose up failed."
  fi
fi

info "Waiting for PostgreSQL…"
wait_for_health postgres 120
info "Waiting for Prisma migration…"
wait_for_migration
info "Waiting for Server…"
wait_for_health server 180
info "Waiting for Web…"
wait_for_health web 120

web_origin="$(read_env_value PTD_WEB_ORIGIN)"
auth_url="$(read_env_value BETTER_AUTH_URL)"
image_tag="$(read_env_value IMAGE_TAG)"
image_tag="${image_tag:-latest}"

printf '\n'
info "Foliq is ready."
printf '  Web: %s\n' "${web_origin%/}/"
printf '  Health: %s/healthz\n' "${web_origin%/}"
printf '  GitHub callback: %s/api/auth/callback/github\n' "${auth_url%/}"
printf '  Image tag: %s\n' "$image_tag"
printf '\nUseful commands:\n'
printf '  ./deploy.sh --status\n'
printf '  ./deploy.sh --logs\n'
printf '  ./deploy.sh --down\n'
printf '  IMAGE_TAG=sha-<full-commit-sha> ./deploy.sh  # deploy/rollback\n'
