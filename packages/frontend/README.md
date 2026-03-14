# @aizu/frontend

This package contains the Aizu web application built with React, TypeScript, and Vite.

## Responsibilities

- Render the end-user interface
- Manage client-side routing and authenticated views
- Fetch and mutate data through the backend API
- Reuse shared constants and types from `@aizu/shared`

## Scripts

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm preview
pnpm clean
```

## Environment

Frontend configuration is loaded from the workspace root `.env` file.

Key variables:

- `VITE_API_URL`
- `VITE_ORGANIZATION_NAME`

## Structure

```text
src/
  components/  Reusable UI and feature components
  contexts/    React context providers
  hooks/       Data hooks and shared UI hooks
  pages/       Route-level pages
  services/    API clients and query helpers
```

## Local Development

From the repository root:

```bash
pnpm dev:frontend
```

The Vite development server runs on `http://localhost:5173` by default.
