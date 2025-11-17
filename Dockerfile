# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat && npm install -g pnpm@8.15.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM base AS backend-build
RUN pnpm --filter @aizu/shared build \
    && pnpm --filter @aizu/backend prisma:generate \
    && pnpm --filter @aizu/backend build

FROM base AS frontend-build
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm --filter @aizu/shared build \
    && pnpm --filter @aizu/frontend build

FROM node:20-alpine AS backend
RUN apk add --no-cache libc6-compat openssl && npm install -g pnpm@8.15.0
WORKDIR /app

# Copy only package files for production dependency installation
COPY --from=base /app/packages/backend/package.json ./package.json
COPY --from=base /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies (external packages needed by bundle)
RUN pnpm install --prod --frozen-lockfile

# Copy the bundled application
COPY --from=backend-build /app/packages/backend/dist ./dist

# Copy shared package build output (referenced by bundle)
COPY --from=backend-build /app/packages/shared/dist ./packages/shared/dist

# Copy Prisma schema and migrations (needed at runtime)
COPY --from=base /app/packages/backend/prisma ./prisma

# Generate Prisma client for production
RUN pnpm prisma generate

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]

FROM nginx:1.25-alpine AS frontend
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80
