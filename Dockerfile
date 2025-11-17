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

# Install only the external dependencies that aren't bundled
# (matching the external list in esbuild.config.js)
RUN pnpm add --save-prod \
    express@^4.18.2 \
    cors@^2.8.5 \
    helmet@^7.1.0 \
    dotenv@^16.3.1 \
    zod@^3.22.4 \
    bcrypt@^5.1.1 \
    jsonwebtoken@^9.0.2 \
    prisma@^5.7.0 \
    @prisma/client@^5.7.0

# Copy the bundled application (includes @aizu/shared)
COPY --from=backend-build /app/packages/backend/dist/index.js ./dist/index.js

# Copy Prisma schema and migrations
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
