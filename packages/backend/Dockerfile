FROM node:20-alpine

# Install pnpm and OpenSSL for Prisma
RUN npm install -g pnpm && \
    apk add --no-cache openssl

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy only the packages needed for the backend workspace install
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Install dependencies for the monorepo (backend relies on @aizu/shared)
RUN pnpm install

WORKDIR /app/packages/backend

EXPOSE 3001

CMD ["pnpm", "dev"]
