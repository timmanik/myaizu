# Aizu

Aizu is an open source prompt management platform for teams.

## Features

- Team-based prompt library with role-aware access
- Prompt creation, organization, search, and discovery
- Collections, favorites, and trending views
- Shared types and constants across frontend and backend
- Docker-based local infrastructure for Postgres and Redis

## Repository Layout

```text
packages/
  backend/   Express API + Prisma
  frontend/  React + Vite web app
  shared/    Shared TypeScript types and constants
```

Keeping the application code in `packages/` is intentional: this repo uses a monorepo layout with pnpm workspaces.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Data: PostgreSQL, Prisma ORM, Redis
- Tooling: pnpm workspaces, Prettier, TypeScript

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker Desktop or Docker Engine

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

### 3. Start local infrastructure

```bash
docker compose up -d postgres redis
```

### 4. Run the app in development mode

```bash
pnpm dev
```

This starts:

- Frontend dev server at `http://localhost:5173`
- Backend API at `http://localhost:3001`

### 5. Run database migrations

```bash
pnpm --filter @aizu/backend prisma:migrate
```

### 6. Seed an admin account for local development

```bash
pnpm --filter @aizu/backend seed:admin
```

Default local credentials:

- Email: `admin@aizu.local`
- Password: `admin123456`

These credentials are for local development only.

## Full Docker Compose

To run the full stack in containers:

```bash
docker compose up --build
```

This exposes:

- Frontend at `http://localhost`
- Backend API at `http://localhost:3001`
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`

## Workspace Commands

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm typecheck
pnpm build
pnpm check
pnpm format:check
```

`pnpm check` runs the current release validation set: type-checking and builds.

## Environment Variables

See `.env.example` for the full list. The most important values are:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `VITE_API_URL`
- `PORT`

## Package Documentation

- `packages/frontend/README.md`
- `packages/backend/README.md`
- `packages/shared/README.md`

## Project Status

Aizu is preparing for a larger open source release. The current CI focuses on type-checking and builds. Formatting can be applied incrementally as the codebase is cleaned up further, and automated tests can be added as the project stabilizes.

## Contributing

See `CONTRIBUTING.md` for local setup, validation steps, and contribution expectations.

## Security

See `SECURITY.md` for how to report vulnerabilities responsibly.

## License

This project is available under the MIT license. See `LICENSE`.
