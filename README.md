# Aizu - The home to your favorite prompts.

A comprehensive platform for managing, sharing, and discovering AI prompts within your organization.

## Features

- **Role-Based Access Control**: Super Admin, Team Admin, and Member roles
- **Team Management**: Organize users into teams with dedicated spaces
- **Prompt Library**: Create, share, and discover prompts across teams
- **Collections**: Organize prompts into curated collections
- **Advanced Search**: Find prompts quickly with filtering and search
- **Trending & Discovery**: See what's popular and new in your organization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Monorepo**: pnpm workspaces

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for local development)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd myaizu
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 5173

### 5. Run database migrations

```bash
cd packages/backend
pnpm prisma migrate dev
```

### 6. Seed the database (optional)

```bash
pnpm prisma db seed
```

## Development

### Start all services

```bash
pnpm dev
```

### Start individual services

```bash
# Frontend only
pnpm dev:frontend

# Backend only
pnpm dev:backend
```

### Build for production

```bash
pnpm build
```

## Database

### Run migrations

```bash
cd packages/backend
pnpm prisma migrate dev
```

### Generate Prisma Client

```bash
cd packages/backend
pnpm prisma generate
```

### Open Prisma Studio

```bash
cd packages/backend
pnpm prisma studio
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origin (frontend URL)
- `PORT`: Backend server port

## Initial Setup

### Create Super Admin User

After the database is set up, create your first Super Admin user:

```bash
cd packages/backend
pnpm seed:admin
```

This creates a Super Admin with:
- **Email**: `admin@aizu.local`
- **Password**: `admin123456`

⚠️ Change the password after first login!

Or set custom credentials:
```bash
SUPER_ADMIN_EMAIL=your@email.com \
SUPER_ADMIN_PASSWORD=yourpassword \
SUPER_ADMIN_NAME="Your Name" \
pnpm seed:admin
```

## API Documentation

API runs on `http://localhost:3001`

### Authentication Endpoints
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register with invite token
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Invite Endpoints
- `POST /api/invites/admin` - Create invite (Super Admin only)
- `GET /api/invites/:token/validate` - Validate invite token (public)
- `GET /api/invites/admin` - List all invites (Super Admin only)
- `DELETE /api/invites/admin/:id` - Revoke invite (Super Admin only)

### System
- `GET /health` - Health check
- `GET /api` - API info

## Testing

See [TESTING-PHASE-1.md](./TESTING-PHASE-1.md) for detailed testing instructions.

Quick test:
1. `cd packages/backend && pnpm seed:admin`
2. Open http://localhost:5173
3. Login with `admin@aizu.local` / `admin123456`
4. Explore the app!

