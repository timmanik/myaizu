FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy only the packages needed for the frontend workspace install
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

# Install dependencies for the monorepo (frontend relies on @aizu/shared)
RUN pnpm install

WORKDIR /app/packages/frontend

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
