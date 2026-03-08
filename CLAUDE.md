# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack party/event management application with a Spring Boot 4.0.2 backend (Java 17) and React 19 + Vite 7 frontend. Uses PostgreSQL 13 for persistence, Redis 7 for caching, and JWT for authentication.

## Common Commands

### Backend (from project root)
```bash
./mvnw spring-boot:run          # Start backend on http://localhost:8080
./mvnw test                      # Run tests
./mvnw clean install             # Build JAR
```

### Frontend (from /frontend)
```bash
npm install                      # Install dependencies
npm run dev                      # Start dev server on http://localhost:5173
npm run build                    # Production build to dist/
npm run lint                     # Run ESLint
```

### Docker
```bash
docker-compose up                # Start all services (postgres, redis, backend, nginx)
docker-compose down              # Stop all services
```

## Architecture

### Backend Structure (Spring Boot)
```
src/main/java/com/party/ceva/demo/
├── controller/     # REST endpoints under /api
├── service/        # Business logic layer
├── repository/     # Spring Data JPA interfaces
├── model/          # JPA entities (User, Role, Event, EventParticipation, Level, News, UserProfile)
├── dto/            # Request/response objects
└── config/         # Security, JWT filter, ModelMapper
```

**Key patterns:**
- Layered architecture: Controller → Service → Repository
- JWT authentication via custom `JwtAuthenticationFilter` in security filter chain
- DTOs separate from entities, mapped via ModelMapper
- Redis caching with Spring @Cacheable
- Role-based authorization: `/api/admin/**` requires `ROLE_ADMIN`; roles stored in `roles` table with `RoleTypes` enum (`ADMIN`, `SIMPATIZANT`, `MEMBRU`); authorities loaded dynamically from user roles
- Maven compiler configured to retain parameter names (`-parameters` flag)

### Frontend Structure (React + Vite)
```
frontend/src/
├── pages/          # Route-level components
├── components/     # Reusable UI components
├── auth/           # AuthContext, route guards (ProtectedRoute, PublicOnlyRoute, RootRedirectRoute)
├── queries/        # React Query hooks
├── forms/          # Form utilities
├── navigation/     # Routing configuration
└── service/        # Business logic helpers
```

**Key patterns:**
- React Query (@tanstack/react-query) for server state
- AuthContext provides useAuth() hook; uses explicit state management with initial loading handled before rendering routes
- Route protection via guard components; `RootRedirectRoute` handles root path redirect
- Vite proxies /api to backend at localhost:8080
- Image crop dialog is lazy-loaded

## Key Configuration Files

- `src/main/resources/application.properties` - Backend config (DB, Redis, JWT, file uploads)
- `frontend/vite.config.js` - Vite config with API proxy
- `frontend/eslint.config.js` - ESLint rules
- `docker-compose.yml` - Service orchestration
- `.sdkmanrc` - Pins Java 17 (`17.0.18-amzn`); run `sdk env` from root to auto-apply

## Development Notes

- API base path: `/api`
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Frontend uses 2-space indentation, semicolons, single quotes
- Components use PascalCase, hooks use useX pattern
- Environment variables for frontend must be prefixed with `VITE_`
- No frontend test framework configured yet; if adding, use Vitest + React Testing Library
- Java version: 17 (Amazon Corretto `17.0.18-amzn`); if hitting version mismatch errors run `sdk env` from repo root

## Authentication Flow

1. Backend issues JWT on successful login (`POST /api/auth/login`)
2. Frontend stores token in localStorage via AuthContext
3. Authenticated requests include token in Authorization header
4. `JwtAuthenticationFilter` validates tokens and loads user authorities from roles in Spring Security chain
5. Admin-only endpoints live under `/api/admin/**` and require `ROLE_ADMIN`

## Authorization

- Roles are defined by the `RoleTypes` enum: `ADMIN`, `SIMPATIZANT`, `MEMBRU`
- Each `Role` entity belongs to a `User` (ManyToOne) and can have `startDate`/`endDate` for time-scoped roles
- Spring Security authorities are dynamically derived from the user's roles at login time
- Public endpoints: `/api/auth/**`, `/api/users/register`, `/api/news` (GET), Swagger UI, `/uploads/**`
