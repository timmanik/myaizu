# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat && npm install -g pnpm
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
RUN apk add --no-cache libc6-compat && npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=backend-build /app/packages/shared ./packages/shared
COPY --from=base /app/packages/backend/package.json ./package.json
COPY --from=base /app/packages/backend/prisma ./prisma
COPY --from=backend-build /app/packages/backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]

FROM nginx:1.25-alpine AS frontend
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80
