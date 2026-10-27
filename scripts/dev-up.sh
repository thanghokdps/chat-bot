#!/usr/bin/env bash
# One command from a cold machine to a running app: Docker → Postgres → migrations + seed → Next dev server.
# Safe to re-run: compose, migrate and seed are idempotent. Usage: pnpm dev:all
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1" >&2; exit 1; }

step "Checking .env"
if [ ! -f .env ]; then
  cp .env.example .env
  fail ".env was missing, so it was created from .env.example. Fill in OPENAI_API_KEY and BETTER_AUTH_SECRET (openssl rand -base64 32), then run again."
fi
# Values stay in this shell; nothing is printed.
set -a; . ./.env; set +a
[ -n "${OPENAI_API_KEY:-}" ] || fail "OPENAI_API_KEY is empty in .env"
[ "${#BETTER_AUTH_SECRET}" -ge 32 ] || fail "BETTER_AUTH_SECRET in .env must be at least 32 characters (openssl rand -base64 32)"

step "Starting Docker"
if ! docker info >/dev/null 2>&1; then
  if command -v colima >/dev/null; then
    colima start
  else
    fail "Docker is not running. Start Docker Desktop (or install colima) and run again."
  fi
fi

step "Starting Postgres on port ${POSTGRES_PORT:-5432}"
docker compose up -d postgres
for _ in $(seq 1 60); do
  docker compose exec -T postgres pg_isready -U chat -d chat >/dev/null 2>&1 && break
  sleep 1
done
docker compose exec -T postgres pg_isready -U chat -d chat >/dev/null 2>&1 || fail "Postgres did not become ready within 60s (docker compose logs postgres)"

step "Installing dependencies"
[ -d node_modules ] || pnpm install --frozen-lockfile

step "Applying migrations and seed"
pnpm db:migrate
pnpm db:seed

# Serve on the port the auth callback URLs use, so OAuth redirects match.
PORT="$(node -e 'console.log(new URL(process.argv[1]).port || 3000)' "${BETTER_AUTH_URL}")"
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  fail "Port $PORT is already in use (another dev server?). Stop it, or change BETTER_AUTH_URL in .env."
fi

step "Starting the app on http://localhost:$PORT (Ctrl+C to stop)"
exec pnpm dev -p "$PORT"
