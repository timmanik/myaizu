# @aizu/backend

This package contains the Aizu backend API built with Express, TypeScript, and Prisma.

## Responsibilities

- Expose the HTTP API used by the frontend
- Handle authentication, authorization, and organization logic
- Persist data with Prisma and PostgreSQL
- Share contracts with the frontend through `@aizu/shared`

## Scripts

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm start
pnpm prisma:migrate
pnpm prisma:generate
pnpm prisma:studio
pnpm seed:admin
```

## Local Development

From the repository root:

```bash
pnpm dev:backend
```

The API listens on `http://localhost:3001` by default.

## Notes

- Prisma schema lives in `prisma/schema.prisma`
- Source code lives in `src/`
- Local environment values are loaded from the workspace root `.env`
