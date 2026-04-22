# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokenerdle is a Pokemon-themed daily challenge game (Wordle-style) with real-time battle mode. It supports SSR, i18n (English, Simplified Chinese, Traditional Chinese), and uses Supabase for auth and user data.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite (SSR) + TanStack Router (file-based routing) + Jotai (state) + TanStack Query + Axios + Socket.io client
- **Backend:** Express.js 5 + TypeScript + Bun (dev runtime) + Socket.io
- **Database:** PostgreSQL (Supabase, user data) + SQLite (PokeAPI data, read-only)
- **ORM:** Prisma v7 with two schemas: `backend/prisma-pg/` (PostgreSQL) and `backend/prisma-sqlite/` (SQLite)
- **Styling:** Tailwind CSS v4 with `tw:` prefix, Radix UI components
- **Package Manager:** pnpm workspaces (three packages: `shared`, `frontend`, `backend`)

## Common Commands

```bash
# Development (runs both frontend and backend concurrently)
pnpm dev

# Individual dev servers
pnpm fe-dev          # Frontend SSR dev server
pnpm be-dev          # Backend (bun --watch)

# Build
pnpm build           # Builds shared → backend + frontend concurrently
pnpm shared-build    # Must build shared first if types changed
pnpm fe-build        # Frontend client + SSR server bundles
pnpm be-build        # Backend TypeScript compilation

# Lint
cd frontend && pnpm lint

# Database
cd backend && ./build-db.sh   # Rebuild SQLite from PokeAPI submodule
cd backend && npx prisma generate --schema=prisma-pg/schema.prisma
cd backend && npx prisma generate --schema=prisma-sqlite/schema.prisma

# Production
pnpm start            # Starts backend (serves SSR frontend)
```

## Architecture

### Workspace Structure

Three pnpm workspace packages with `shared` as a dependency of both `frontend` and `backend`.

### Backend (Express.js)

Layered architecture: `routes/ → controllers/ → services/ → repositories/`

- **Two Prisma clients:** SQLite (`src/lib/prisma.ts`) for Pokemon data, PostgreSQL (`src/lib/pg.ts`) for user data
- **Auth middleware:** `authenticateUser` (optional), `strictAuthenticateUser` (required), `optionalAuthenticateUser` — all in `src/middlewares/auth.js`
- **Daily challenges** use seeded RNG (`seedrandom`) for reproducible daily Pokemon selection
- **WebSocket handlers** in `src/handlers/` for battle mode via Socket.io
- **PokeAPI submodule** at `backend/pokeapi` — used only for building the SQLite database

### Frontend (React + Vite SSR)

- **SSR entry points:** `entry-client.tsx` (hydration) and `entry-server.tsx` (server render)
- **SSR middleware:** `server.js` — Express middleware that handles SSR in both dev (Vite dev server) and production (compiled bundle)
- **File-based routing** via TanStack Router in `src/routes/`
- **API client** in `src/api/` — Axios with auth token and PostHog interceptors
- **State atoms** in `src/atoms/` — Jotai for auth, app store, and theme

### Shared Package

Exports via subpath: `@pokenerdle/shared`, `@pokenerdle/shared/utils`, `@pokenerdle/shared/daily`, `@pokenerdle/shared/pokemon`, `@pokenerdle/shared/date`. Contains Zod validation schemas, types, and date utilities with timezone support. Must be built (`pnpm shared-build`) before frontend/backend can use updated types.

## Key Details

- Frontend path alias: `@/*` maps to `frontend/src/*`
- Backend runs on port 3456 by default
- Deployment target is Heroku (see `Procfile`) with PostHog source map upload
- The SQLite database is generated from the PokeAPI submodule and is read-only at runtime
- Backend uses Node.js in production (`node --es-module-specifier-resolution=node`) but Bun in development
- When running tsc for type checking purposes, do `pnpm tsc` rather than `npx tsc`
