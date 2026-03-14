# Contributing to Aizu

Thanks for your interest in contributing.

## Development Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start local infrastructure:

   ```bash
   docker compose up -d postgres redis
   ```

4. Start the app:

   ```bash
   pnpm dev
   ```

## Repository Layout

```text
packages/backend   API server
packages/frontend  Web application
packages/shared    Shared types and constants
```

## Validation

Before opening a pull request, run:

```bash
pnpm typecheck
pnpm build
```

Or run the combined check:

```bash
pnpm check
```

If you touch files that are not already formatted, run:

```bash
pnpm format
```

## Pull Requests

- Keep changes focused and easy to review
- Update docs when behavior or setup changes
- Prefer small, well-scoped pull requests over broad refactors
- Include screenshots for visible UI changes when helpful

## Commit Style

No strict commit format is required, but clear and descriptive commit messages are strongly preferred.
