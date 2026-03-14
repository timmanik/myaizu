FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy only the packages needed for the frontend workspace install
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared

# Install dependencies for the monorepo (frontend relies on @aizu/shared)
RUN pnpm install

# Build the shared package
RUN pnpm --filter @aizu/shared build

WORKDIR /app/apps/frontend

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
