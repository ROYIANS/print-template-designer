# Frontend deployment

The current deployment contains the standalone Web designer only. The backend, database and API
proxy are deliberately excluded until their application contract is ready.

## How the release flow works

```text
GitHub push / tag / manual run
             │
             ▼
Frontend typecheck + tests + lint + build
             │
             ▼
Docker Buildx publishes to GHCR
             │
             ▼
Server runs deploy.sh / deploy.ps1
             │
             ▼
docker compose pull → up --no-build → /healthz
```

The server never compiles the repository. The runtime image is Nginx plus the Vite static output,
so Node.js and pnpm are not required on the deployment host.

## Published image and tags

The workflow publishes this image by default:

```text
ghcr.io/royians/print-template-designer-web
```

| Git event                  | Published tags                           | Intended use               |
| -------------------------- | ---------------------------------------- | -------------------------- |
| Push to any branch         | normalized branch name, `sha-<full-sha>` | preview and exact rollback |
| Push to the default branch | branch, SHA, `latest`                    | normal deployment          |
| Push a `v*` Git tag        | Git tag, SHA                             | named release              |
| Pull request               | no image                                 | quality checks only        |
| Manual workflow run        | current branch, SHA                      | rebuild or preview         |

For example, `feature/refc` is normalized by Docker Metadata Action to `feature-refc`. Until that
branch is merged into the repository default branch, deploy `IMAGE_TAG=feature-refc` rather than
`latest` to preview its current UI.

## Prerequisites

- A Linux server (recommended) or Windows Server with PowerShell 7.
- Docker Engine with the Docker Compose v2 plugin (`docker compose version`).
- Network access to `ghcr.io`.
- Git, only to clone and update the Compose/scripts in this repository.

No Node.js, pnpm, compiler or local Docker Buildx installation is required on the server.

## First deployment on Linux

Push the branch to GitHub first and wait for the `Frontend CI & GHCR` workflow to succeed. Then:

```bash
git clone https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
chmod +x deploy.sh
./deploy.sh
```

The first run copies `.env.example` to `.env`. The defaults expose the site at:

```text
http://<server-ip>:8080
```

To preview the current feature branch before it is merged, clone that branch and override its image
tag on the first run:

```bash
git clone --branch feature/refc --single-branch https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
IMAGE_TAG=feature-refc ./deploy.sh
```

Alternatively, edit `.env` and keep the branch tag there:

```dotenv
WEB_PORT=8080
IMAGE_REPOSITORY=ghcr.io/royians/print-template-designer-web
IMAGE_TAG=feature-refc
```

The script pulls the selected image, recreates only the frontend service and waits until the
container reports a healthy `/healthz` response.

## First deployment on Windows Server

From PowerShell 7:

```powershell
git clone https://github.com/ROYIANS/print-template-designer.git
Set-Location print-template-designer
.\deploy.ps1
```

The `.env` keys and behavior are identical to the Bash deployment.

## Private GHCR packages

The first GHCR publication is often private. You can either make the package public in GitHub's
package settings or use a token that has only `read:packages` permission.

Prefer passing credentials from the server's secret store or shell environment:

```bash
export GHCR_USERNAME=your-github-username
export GHCR_TOKEN=github_pat_xxx
./deploy.sh
```

PowerShell equivalent:

```powershell
$env:GHCR_USERNAME = 'your-github-username'
$env:GHCR_TOKEN = 'github_pat_xxx'
.\deploy.ps1
```

The scripts also recognize those two keys in `.env`, but a plaintext token file should only be
used on a locked-down host. Never commit `.env`; it is gitignored.

## Updating

For a mutable tag such as `latest` or a branch preview tag:

```bash
git pull --ff-only
./deploy.sh
```

The script always runs `docker compose pull` before recreating the container. Compose contains no
`build:` section and the script explicitly uses `up --no-build`.

## Pinning and rollback

For production or a review that must not change underneath you, copy the full SHA tag from the
workflow or GHCR package page:

```dotenv
IMAGE_TAG=sha-0123456789abcdef0123456789abcdef01234567
```

Run `./deploy.sh` again. Rollback uses the same operation: replace `IMAGE_TAG` with a previously
known-good SHA tag and redeploy. No source checkout reset and no server-side rebuild are needed.

## Operations

Linux / macOS / Git Bash:

```bash
./deploy.sh --status
./deploy.sh --logs
./deploy.sh --down
```

PowerShell 7:

```powershell
.\deploy.ps1 -Status
.\deploy.ps1 -Logs
.\deploy.ps1 -Down
```

Direct Compose commands remain available when needed:

```bash
docker compose ps
docker compose logs --tail=100 web
docker inspect ptd-web
```

## Reverse proxy and TLS

For an internet-facing server, put Caddy, Traefik or an existing Nginx instance in front of port
8080 and terminate TLS there. If the proxy runs on the same host, bind the port to loopback by
changing the Compose `ports` entry to `127.0.0.1:${WEB_PORT:-8080}:80` in your deployment fork.

## Troubleshooting

### `manifest unknown`

The selected `IMAGE_TAG` has not been published. Confirm that the GitHub Actions run completed and
that branch slashes were normalized to dashes (for example, `feature/refc` → `feature-refc`).

### `denied` while pulling from GHCR

The package is private or the token cannot access it. Supply both `GHCR_USERNAME` and a token with
`read:packages`, or make the package public.

### Container is unhealthy

Run `./deploy.sh --logs` (or `.\deploy.ps1 -Logs`) and inspect the Nginx startup output. The script
also prints the last 100 log lines when the health check fails or times out.

### Port 8080 is already in use

Change `WEB_PORT` in `.env`, then redeploy. For example, `WEB_PORT=8088` exposes the site on port
8088 without changing the container image.

## CI and architecture notes

- The workflow currently publishes `linux/amd64`, matching typical x86-64 servers.
- ARM64 servers require adding `linux/arm64` to the workflow's `platforms` list before deployment.
- The first real container build is performed by GitHub Actions. Local static checks cannot replace
  that build, especially on a development machine without Docker.
