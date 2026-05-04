# AGENTS.md — Dalika Project Context

## Overview
Full-stack quote management system ("Dalika Quotes"). Backend: Java Spring Boot. Frontend: React + TypeScript + Vite + Tailwind CSS.

## Project Structure
```
dalika/
├── dalika-bk/              ← Spring Boot backend (port 8080)
│   ├── src/
│   ├── Dockerfile          ← Backend Docker image
│   └── docker-compose.yml  ← Backend-only compose (deprecated, use root)
├── db/                     ← Database scripts
│   └── init/               ← PostgreSQL initialization scripts
│       └── 01-init.sql
├── src/                    ← React frontend source (port 5173 dev)
├── dist/                   ← Production build output
├── docker-compose.yml      ← Root Docker compose (postgres + backend + frontend)
├── Dockerfile.frontend     ← Frontend Docker image
├── .env                    ← Environment variables
└── vite.config.ts          ← Vite config (host: 0.0.0.0 for Docker)
```

## Backend (`dalika-bk/`)

### Stack
- **Java**: 17 (JDK path: `C:\Program Files\Java\jdk-17`)
- **Spring Boot**: 3.2.4 (Spring 6.1.5, Hibernate 6.4.4, Tomcat 10.1.19)
- **Security**: Spring Security 6.x + JWT (jjwt 0.12.5)
- **DB**: H2 in-memory (dev), PostgreSQL (prod)
- **Tooling**: Lombok, MapStruct, Maven

### Key Decisions
- Use **Java records** for all DTOs (not Lombok classes)
- Use **Lombok** only for entities (`@Entity`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- Imports use `jakarta.*` (NOT `javax.*`) — this is Spring Boot 3
- IDs use `@GenericGenerator(name="uuid", strategy="uuid2")` for String UUIDs
- `WebSecurityCustomizer` is NOT used — all route security goes through `HttpSecurity.authorizeHttpRequests().requestMatchers(...).permitAll()`
- The `refreshToken` column on `User` has `length = 1000` (JWTs exceed 255 chars)
- `@EnableJpaAuditing` is on the main application class
- `toList()` is available (Java 16+) — use `Collectors.toList()` only if targeting Java 11

### Commands
```bash
# Compile
mvn clean compile

# Run with dev profile (H2 + seed data)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with prod profile (PostgreSQL)
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Build JAR (required for Docker)
mvn clean package -DskipTests

# Docker - Full stack (from project root)
docker-compose up --build           # Foreground
docker-compose up -d --build       # Background
docker-compose down                 # Stop all services
docker-compose logs -f              # View logs

# Docker - Individual services
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Domain Model

#### Entities
| Entity | Package | Notes |
|--------|---------|-------|
| `User` | `user.entity` | Roles: ADMIN, REP, CLIENT. Has `refreshToken` field |
| `Brand` | `brand.entity` | ManyToMany with Category |
| `Category` | `category.entity` | ManyToMany with Brand |
| `QuoteRequest` | `quote.entity` | Belongs to User (client). Has OneToOne QuoteResponse |
| `QuoteItem` | `quote.entity` | Belongs to QuoteRequest |
| `QuoteResponse` | `quote.entity` | OneToOne with QuoteRequest |

#### Enums
- `Role`: `ADMIN`, `REP`, `CLIENT`
- `QuoteStatus`: `PENDING`, `QUOTED`, `ACCEPTED`, `REJECTED`, `EXPIRED`

### API Endpoints
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/login` | Public | Login → returns accessToken + refreshToken |
| POST | `/api/v1/auth/refresh` | Public | Refresh token |
| POST | `/api/v1/auth/logout` | Authenticated | Clear refresh token |
| GET | `/api/v1/users` | ADMIN | Paginated user list |
| GET | `/api/v1/users/{id}` | ADMIN | User by ID |
| POST | `/api/v1/users` | ADMIN | Create user |
| PUT | `/api/v1/users/{id}` | ADMIN | Update user |
| DELETE | `/api/v1/users/{id}` | ADMIN | Delete user |
| GET | `/api/v1/brands` | Public (GET only) | Paginated brand list |
| GET | `/api/v1/brands/{id}` | Public (GET only) | Brand by ID |
| POST | `/api/v1/brands` | ADMIN/REP | Create brand |
| PUT | `/api/v1/brands/{id}` | ADMIN/REP | Update brand |
| DELETE | `/api/v1/brands/{id}` | ADMIN/REP | Delete brand |
| GET | `/api/v1/categories` | Public (GET only) | Paginated category list |
| GET | `/api/v1/categories/{id}` | Public (GET only) | Category by ID |
| POST | `/api/v1/categories` | ADMIN/REP | Create category |
| PUT | `/api/v1/categories/{id}` | ADMIN/REP | Update category |
| DELETE | `/api/v1/categories/{id}` | ADMIN/REP | Delete category |
| GET | `/api/v1/quote-requests` | Authenticated | Client sees own, Admin/Rep sees all |
| GET | `/api/v1/quote-requests/{id}` | Authenticated | Detail with items + response |
| POST | `/api/v1/quote-requests` | CLIENT only | Create quote request |
| PATCH | `/api/v1/quote-requests/{id}/status` | ADMIN/REP | Update status |
| POST | `/api/v1/quote-requests/{id}/response` | ADMIN/REP | Add response to quote |
| DELETE | `/api/v1/quote-requests/{id}` | Authenticated | Delete own (client) or any (admin/rep) |

### Dev Seed Data
- **Admin**: `admin@dalika.com` / `admin123`
- **Rep**: `rep@dalika.com` / `rep123`
- **Client**: `client@example.com` / `client123`
- 5 categories: Electronica, Hogar, Industrial, Oficina, Deportes
- 6 brands: Samsung, LG, Bosch, IKEA, Herman Miller, Apple
- 3 quote requests with sample items

### Response Format
All endpoints return:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "status": 404, "message": "...", "path": "...", "timestamp": "..." }
```
Validation errors return `ValidationErrorResponse` with `errors` map.

### Profiles
- `dev`: H2 in-memory, H2 console at `/h2-console`, `create-drop` DDL, debug logging, seed data initialized
- `prod`: PostgreSQL, `update` DDL (auto-creates/updates tables), env vars for DB/JWT/CORS, seed data initialized

### Docker Setup
Root `docker-compose.yml` orchestrates three services:
1. **postgres**: PostgreSQL 16 with persistent volume and init scripts
2. **backend**: Spring Boot app with prod profile, connects to Postgres
3. **frontend**: React dev server with Vite (host: 0.0.0.0 for container access)

The `DataInitializer` now runs on both `dev` and `prod` profiles, so seed data is created automatically in PostgreSQL.

## Frontend (`dalika/`)

### Stack
- **React 19** + TypeScript + Vite
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **State management**: Zustand
- **Routing**: React Router v7
- **HTTP client**: Axios
- **Icons**: lucide-react
- **Build output**: `dist/` directory

### Commands
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

### API Base URL
Configured via `.env` file. Points to `http://localhost:8080` in development.

## Common Pitfalls
1. **Java version mismatch**: If using Java 11, downgrade to Spring Boot 2.7.x and convert all records to classes with getters/setters. This project uses **Java 17+**.
2. **`jakarta.*` vs `javax.*`**: Spring Boot 3 uses `jakarta.*`. Spring Boot 2 uses `javax.*`.
3. **`WebSecurityCustomizer` with permitAll**: Do NOT use `webSecurityCustomizer` to ignore auth paths — it prevents Spring Security filters from running entirely. Use `requestMatchers(...).permitAll()` in the `SecurityFilterChain` instead.
4. **Token length**: JWT tokens exceed 255 characters. The `User.refreshToken` column must be `length = 1000` or use `@Column(columnDefinition = "TEXT")`.
5. **`toList()`**: Available in Java 16+. If backporting to Java 11, use `.collect(Collectors.toList())`.
6. **Lombok + Records**: Do NOT mix. Entities use Lombok; DTOs use native Java records.
7. **Port conflicts**: Backend runs on 8080, frontend on 5173. Kill any existing Java processes with `taskkill //F //IM java.exe` on Windows before restarting.
8. **Docker frontend not accessible**: Ensure `vite.config.ts` has `server: { host: '0.0.0.0' }` for container access.
9. **DataInitializer not running in prod**: The `@Profile` annotation now includes both "dev" and "prod" to ensure seed data is created in PostgreSQL.

## Authentication Flow
1. Client POSTs to `/api/v1/auth/login` with email + password
2. Server returns `{ accessToken, refreshToken, tokenType: "Bearer" }`
3. Client includes `Authorization: Bearer <accessToken>` in all subsequent requests
4. On access token expiry, POST to `/api/v1/auth/refresh` with `{ refreshToken }`
5. On logout, POST to `/api/v1/auth/logout` (clears server-side refresh token)
