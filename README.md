# Dalika Quotes - Sistema de Gestión de Cotizaciones

Sistema full-stack de gestión de cotizaciones ("Dalika Quotes"). Backend desarrollado en Java Spring Boot y frontend en React + TypeScript + Vite + Tailwind CSS.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración e Instalación](#configuración-e-instalación)
  - [Prerrequisitos](#prerrequisitos)
  - [Backend (Spring Boot)](#backend-spring-boot)
  - [Frontend (React)](#frontend-react)
  - [Docker (Recomendado)](#docker-recomendado)
- [Perfiles de Spring](#perfiles-de-spring)
- [API Endpoints](#api-endpoints)
- [Modelo de Dominio](#modelo-de-dominio)
- [Datos de Inicialización](#datos-de-inicialización)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Solución de Problemas](#solución-de-problemas)

## Características

- Gestión completa de usuarios con roles (ADMIN, REP, CLIENT)
- Catálogo de marcas y categorías con relación Many-to-Many
- Sistema de cotizaciones con estados (PENDING, QUOTED, ACCEPTED, REJECTED, EXPIRED)
- Autenticación JWT con refresh tokens
- Respuestas a cotizaciones por parte de administradores/vendedores
- Interfaz moderna con React 19 y Tailwind CSS 4
- Despliegue completo con Docker (PostgreSQL + Backend + Frontend)

## Tecnologías

### Backend (`dalika-bk/`)
- **Java**: 17 (JDK)
- **Spring Boot**: 3.2.4
  - Spring 6.1.5
  - Hibernate 6.4.4
  - Tomcat 10.1.19
- **Seguridad**: Spring Security 6.x + JWT (jjwt 0.12.5)
- **Base de Datos**: H2 in-memory (dev), PostgreSQL 16 (prod)
- **Herramientas**: Lombok, MapStruct, Maven

### Frontend (`dalika/`)
- **React 19** + TypeScript + Vite 8
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Gestión de estado**: Zustand
- **Enrutamiento**: React Router v7
- **Cliente HTTP**: Axios
- **Iconos**: lucide-react

## Estructura del Proyecto

```
dalika/
├── dalika-bk/              ← Backend Spring Boot (puerto 8080)
│   ├── src/
│   │   └── main/java/com/dalika/quotes/
│   │       ├── auth/       ← Autenticación y JWT
│   │       ├── user/       ← Gestión de usuarios
│   │       ├── brand/      ← Gestión de marcas
│   │       ├── category/   ← Gestión de categorías
│   │       ├── quote/      ← Cotizaciones, items y respuestas
│   │       ├── config/     ← Configuración y DataInitializer
│   │       └── exception/  ← Manejo de errores global
│   ├── Dockerfile          ← Imagen Docker del backend
│   ├── docker-compose.yml  ← Compose solo backend (deprecated)
│   └── pom.xml
├── db/                     ← Scripts de base de datos
│   └── init/
│       └── 01-init.sql     ← Script de inicialización PostgreSQL
├── src/                    ← Código fuente frontend (puerto 5173 dev)
├── dist/                   ← Build de producción
├── docker-compose.yml      ← Docker compose raíz (postgres + backend + frontend)
├── Dockerfile.frontend     ← Imagen Docker del frontend
├── .env                    ← Variables de entorno
├── vite.config.ts          ← Configuración Vite (host: 0.0.0.0)
├── package.json
└── README.md
```

## Configuración e Instalación

### Prerrequisitos

- **Java 17** o superior
- **Maven 3.6+**
- **Node.js 20+** y npm
- **Docker** y Docker Compose (para despliegue con contenedores)
- **PostgreSQL 16** (solo para desarrollo sin Docker)

### Backend (Spring Boot)

```bash
# Compilar
cd dalika-bk
mvn clean compile

# Ejecutar con perfil dev (H2 en memoria + datos de prueba)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Ejecutar con perfil prod (PostgreSQL)
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Generar JAR (requerido para Docker)
mvn clean package -DskipTests
```

### Frontend (React)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 5173)
npm run dev

# Build de producción
npm run build

# Previsualizar build de producción
npm run preview

# Linting
npm run lint
```

### Docker (Recomendado)

La forma más sencilla de ejecutar todo el proyecto es usando Docker Compose desde la raíz del proyecto:

```bash
# Construir el JAR del backend primero
cd dalika-bk
mvn clean package -DskipTests
cd ..

# Iniciar todos los servicios (foreground)
docker-compose up --build

# O en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir un servicio específico
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

**Servicios incluidos:**
1. **postgres**: PostgreSQL 16 con volumen persistente y scripts de inicialización
2. **backend**: Aplicación Spring Boot con perfil prod
3. **frontend**: Servidor de desarrollo React con Vite

**URLs de acceso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Consola H2 (solo perfil dev): http://localhost:8080/h2-console

## Perfiles de Spring

### `dev` (Desarrollo)
- Base de datos H2 en memoria
- Consola H2 disponible en `/h2-console`
- DDL `create-drop` (recrea tablas al iniciar)
- Logging de debug activado
- Datos de prueba inicializados automáticamente

### `prod` (Producción)
- Base de datos PostgreSQL 16
- DDL `update` (crea/actualiza tablas automáticamente)
- Variables de entorno para configuración de BD/JWT/CORS
- Datos de prueba inicializados automáticamente
- Optimizado para despliegue con Docker

## API Endpoints

### Autenticación (Público)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login → retorna accessToken + refreshToken |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| POST | `/api/v1/auth/logout` | Cerrar sesión (limpia refresh token) |

### Usuarios (ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/users` | Lista paginada de usuarios |
| GET | `/api/v1/users/{id}` | Usuario por ID |
| POST | `/api/v1/users` | Crear usuario |
| PUT | `/api/v1/users/{id}` | Actualizar usuario |
| DELETE | `/api/v1/users/{id}` | Eliminar usuario |

### Marcas (Público GET, ADMIN/REP escribir)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/brands` | Lista paginada de marcas |
| GET | `/api/v1/brands/{id}` | Marca por ID |
| POST | `/api/v1/brands` | Crear marca |
| PUT | `/api/v1/brands/{id}` | Actualizar marca |
| DELETE | `/api/v1/brands/{id}` | Eliminar marca |

### Categorías (Público GET, ADMIN/REP escribir)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/categories` | Lista paginada de categorías |
| GET | `/api/v1/categories/{id}` | Categoría por ID |
| POST | `/api/v1/categories` | Crear categoría |
| PUT | `/api/v1/categories/{id}` | Actualizar categoría |
| DELETE | `/api/v1/categories/{id}` | Eliminar categoría |

### Cotizaciones (Autenticado)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/quote-requests` | Listar cotizaciones (cliente ve propias, admin/rep ven todas) |
| GET | `/api/v1/quote-requests/{id}` | Detalle con items + respuesta |
| POST | `/api/v1/quote-requests` | Crear cotización (solo CLIENT) |
| PATCH | `/api/v1/quote-requests/{id}/status` | Actualizar estado (ADMIN/REP) |
| POST | `/api/v1/quote-requests/{id}/response` | Agregar respuesta (ADMIN/REP) |
| DELETE | `/api/v1/quote-requests/{id}` | Eliminar (cliente: propias, admin/rep: todas) |

### Formato de Respuesta

**Éxito:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "status": 404,
  "message": "...",
  "path": "...",
  "timestamp": "..."
}
```

Errores de validación retornan `ValidationErrorResponse` con mapa de errores.

## Modelo de Dominio

### Entidades
| Entidad | Paquete | Notas |
|---------|---------|-------|
| `User` | `user.entity` | Roles: ADMIN, REP, CLIENT. Tiene campo `refreshToken` |
| `Brand` | `brand.entity` | Relación ManyToMany con Category |
| `Category` | `category.entity` | Relación ManyToMany con Brand |
| `QuoteRequest` | `quote.entity` | Pertenece a User (cliente). Tiene OneToOne QuoteResponse |
| `QuoteItem` | `quote.entity` | Pertenece a QuoteRequest |
| `QuoteResponse` | `quote.entity` | OneToOne con QuoteRequest |

### Enums
- **Role**: `ADMIN`, `REP`, `CLIENT`
- **QuoteStatus**: `PENDING`, `QUOTED`, `ACCEPTED`, `REJECTED`, `EXPIRED`

### Decisiones de Diseño
- **DTOs**: Usar **Java records** (no clases Lombok)
- **Entidades**: Usar **Lombok** (`@Entity`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- **Imports**: Usar `jakarta.*` (NO `javax.*`) - Spring Boot 3
- **IDs**: Usar `@GenericGenerator(name="uuid", strategy="uuid2")` para UUIDs tipo String
- **Seguridad**: NO usar `WebSecurityCustomizer` - usar `requestMatchers(...).permitAll()` en `SecurityFilterChain`
- **Tokens**: La columna `refreshToken` en `User` tiene `length = 1000` (los JWT exceden 255 caracteres)
- **Auditoría**: `@EnableJpaAuditing` está en la clase principal de la aplicación
- **Java 16+**: `toList()` está disponible - usar `Collectors.toList()` solo si se apunta a Java 11

## Datos de Inicialización

El `DataInitializer` se ejecuta automáticamente en los perfiles **dev** y **prod** cuando la base de datos está vacía.

### Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@dalika.com` | `admin123` |
| Rep | `rep@dalika.com` | `rep123` |
| Cliente | `client@example.com` | `client123` |
| Cliente 2 | `client2@example.com` | `client123` |

### Datos Semilla
- **5 Categorías**: Electrónica, Hogar, Industrial, Oficina, Deportes
- **6 Marcas**: Samsung, LG, Bosch, IKEA, Herman Miller, Apple
- **3 Cotizaciones de ejemplo** con items y respuestas

## Flujo de Autenticación

1. Cliente hace POST a `/api/v1/auth/login` con email + contraseña
2. Servidor retorna `{ accessToken, refreshToken, tokenType: "Bearer" }`
3. Cliente incluye `Authorization: Bearer <accessToken>` en requests subsecuentes
4. Al expirar el access token, hace POST a `/api/v1/auth/refresh` con `{ refreshToken }`
5. Al cerrar sesión, hace POST a `/api/v1/auth/logout` (limpia refresh token del servidor)

## Variables de Entorno

### Backend (.env o variables del sistema)
```
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/dalika_quotes
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=update
JWT_SECRET=YourSuperSecretKeyForJwtTokenGenerationMustBeAtLeast256BitsLong12345678901234567890
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

## Solución de Problemas

1. **Error de versión de Java**: Este proyecto usa **Java 17+**. Si usas Java 11, degrada a Spring Boot 2.7.x y convierte todos los records a clases con getters/setters.

2. **`jakarta.*` vs `javax.*`**: Spring Boot 3 usa `jakarta.*`. Spring Boot 2 usa `javax.*`.

3. **`WebSecurityCustomizer` con permitAll**: NO usar `webSecurityCustomizer` para ignorar rutas de autenticación - esto previene que los filtros de Spring Security se ejecuten. Usar `requestMatchers(...).permitAll()` en el `SecurityFilterChain`.

4. **Longitud del token**: Los tokens JWT exceden 255 caracteres. La columna `User.refreshToken` debe tener `length = 1000` o usar `@Column(columnDefinition = "TEXT")`.

5. **`toList()`**: Disponible en Java 16+. Si haces backport a Java 11, usa `.collect(Collectors.toList())`.

6. **Lombok + Records**: NO mezclar. Las entidades usan Lombok; los DTOs usan records nativos de Java.

7. **Conflictos de puertos**: Backend en 8080, frontend en 5173. Mata procesos Java existentes con `taskkill //F //IM java.exe` en Windows antes de reiniciar.

8. **Frontend no accesible en Docker**: Asegurar que `vite.config.ts` tenga `server: { host: '0.0.0.0' }` para acceso desde el contenedor.

9. **DataInitializer no se ejecuta en prod**: La anotación `@Profile` incluye tanto "dev" como "prod" para asegurar que los datos semilla se creen en PostgreSQL.

10. **Problemas con Docker**: Si hay errores al iniciar, verifica que el JAR esté construido (`mvn clean package -DskipTests` en dalika-bk/) antes de ejecutar `docker-compose up --build`.

## Licencia

[Add your license information here]

## Contacto

[Add contact information here]
