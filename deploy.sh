#!/usr/bin/env bash
# Pull and run the prebuilt frontend image. This script never builds on the server.
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

readonly SERVICE_NAME="web"

info() { printf '\033[32m▸\033[0m %s\n' "$*"; }
warn() { printf '\033[33m▸\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

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

show_help() {
  cat <<'EOF'
Usage: ./deploy.sh [option]

  (default)  Pull the configured GHCR image and recreate the frontend
  --status   Show container and image status
  --logs     Follow frontend logs
  --down     Stop and remove the frontend container
  -h, --help Show this help

Configuration is read by Docker Compose from .env. This script has no local-build mode.
EOF
}

wait_for_health() {
  local container_id status
  local deadline=$((SECONDS + 120))

  container_id="$(docker compose ps -q "$SERVICE_NAME")"
  [[ -n "$container_id" ]] || fail "The frontend container was not created."

  while (( SECONDS < deadline )); do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)"
    case "$status" in
      healthy)
        return 0
        ;;
      unhealthy|exited|dead)
        docker compose ps
        docker compose logs --tail=100 "$SERVICE_NAME"
        fail "Frontend health check failed with status: $status"
        ;;
    esac
    sleep 2
  done

  docker compose ps
  docker compose logs --tail=100 "$SERVICE_NAME"
  fail "Timed out waiting for the frontend health check."
}

ACTION="deploy"
if (( $# > 1 )); then
  show_help
  fail "Only one option can be used at a time."
fi

if (( $# == 1 )); then
  case "$1" in
    --status) ACTION="status" ;;
    --logs) ACTION="logs" ;;
    --down) ACTION="down" ;;
    -h|--help) show_help; exit 0 ;;
    *) show_help; fail "Unknown option: $1" ;;
  esac
fi

require_docker

case "$ACTION" in
  status)
    docker compose ps
    exit 0
    ;;
  logs)
    docker compose logs -f "$SERVICE_NAME"
    exit 0
    ;;
  down)
    info "Stopping the frontend…"
    docker compose down --remove-orphans
    exit 0
    ;;
esac

if [[ ! -f .env ]]; then
  [[ -f .env.example ]] || fail "Missing .env and .env.example."
  cp .env.example .env
  warn "Created .env from .env.example. Review it before production use."
fi

ghcr_username="$(read_env_value GHCR_USERNAME)"
ghcr_token="$(read_env_value GHCR_TOKEN)"
if [[ -n "$ghcr_username" || -n "$ghcr_token" ]]; then
  [[ -n "$ghcr_username" && -n "$ghcr_token" ]] \
    || fail "GHCR_USERNAME and GHCR_TOKEN must be provided together."
  info "Logging in to GHCR as ${ghcr_username}…"
  printf '%s' "$ghcr_token" \
    | docker login ghcr.io --username "$ghcr_username" --password-stdin >/dev/null
fi

image_repository="$(read_env_value IMAGE_REPOSITORY)"
image_tag="$(read_env_value IMAGE_TAG)"
web_port="$(read_env_value WEB_PORT)"
image_repository="${image_repository:-ghcr.io/royians/print-template-designer-web}"
image_tag="${image_tag:-latest}"
web_port="${web_port:-8080}"

info "Pulling ${image_repository}:${image_tag}…"
docker compose pull "$SERVICE_NAME"

info "Recreating the frontend without a local build…"
docker compose up -d --no-build --force-recreate --remove-orphans "$SERVICE_NAME"

info "Waiting for /healthz…"
wait_for_health

printf '\n'
info "Print Template Designer is ready."
printf '  URL: http://localhost:%s/\n' "$web_port"
printf '  Image: %s:%s\n' "$image_repository" "$image_tag"
printf '\nUseful commands:\n'
printf '  ./deploy.sh --status\n'
printf '  ./deploy.sh --logs\n'
printf '  ./deploy.sh --down\n'
