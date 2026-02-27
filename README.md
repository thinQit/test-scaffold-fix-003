# test-scaffold-fix-003

A simple task manager web app with user authentication, full CRUD for tasks, and a dashboard showing task statistics.

## Features
- User registration and login with JWT-based auth
- Task CRUD with filtering, sorting, and pagination
- Dashboard with status counts, upcoming due tasks, and completion trends
- Global error handling, loading states, and notifications

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma (SQLite)
- Tailwind CSS
- Jest + React Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
bash install.sh
# or on Windows
./install.ps1
```

Then run:
```bash
npm run dev
```

## Environment Variables
See `.env.example`:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/
  app/            # App Router pages and API routes
  components/     # Reusable UI components
  lib/            # Utilities and API helpers
  providers/      # Context providers
  types/          # Shared types
prisma/           # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/stats`
- `GET /api/dashboard`

## Available Scripts
- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

## Testing
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Notes
- Passwords are hashed with bcryptjs
- JWTs are used for stateless authentication
