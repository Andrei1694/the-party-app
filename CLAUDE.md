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
├── model/          # JPA entities
├── dto/            # Request/response objects
└── config/         # Security, JWT filter, ModelMapper
```

**Key patterns:**
- Layered architecture: Controller → Service → Repository
- JWT authentication via custom `JwtAuthenticationFilter` in security filter chain
- DTOs separate from entities, mapped via ModelMapper
- Redis caching with Spring @Cacheable

### Frontend Structure (React + Vite)
```
frontend/src/
├── pages/          # Route-level components
├── components/     # Reusable UI components
├── auth/           # AuthContext, route guards (ProtectedRoute, PublicOnlyRoute)
├── queries/        # React Query hooks
├── forms/          # Form utilities
├── navigation/     # Routing configuration
└── service/        # Business logic helpers
```

**Key patterns:**
- React Query (@tanstack/react-query) for server state
- AuthContext provides useAuth() hook for auth state
- Route protection via guard components
- Vite proxies /api to backend at localhost:8080

## Key Configuration Files

- `src/main/resources/application.properties` - Backend config (DB, Redis, JWT, file uploads)
- `frontend/vite.config.js` - Vite config with API proxy
- `frontend/eslint.config.js` - ESLint rules
- `docker-compose.yml` - Service orchestration

## Development Notes

- API base path: `/api`
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Frontend uses 2-space indentation, semicolons, single quotes
- Components use PascalCase, hooks use useX pattern
- Environment variables for frontend must be prefixed with `VITE_`
- No frontend test framework configured yet; if adding, use Vitest + React Testing Library

## Authentication Flow

1. Backend issues JWT on successful login (`POST /api/auth/login`)
2. Frontend stores token in localStorage via AuthContext
3. Authenticated requests include token in Authorization header
4. `JwtAuthenticationFilter` validates tokens in Spring Security chain
