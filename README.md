# Library Management System

A full-stack library management platform with role-based access (Admin / User), JWT authentication, a complete borrowing workflow with overdue tracking, and an analytics dashboard. Built as a university thesis project on Spring Boot 3 and React 18.

## Tech Stack

| Frontend                                  | Backend                                | Database                      |
|-------------------------------------------|----------------------------------------|-------------------------------|
| React 18, TypeScript, Vite                | Java 17, Spring Boot 3.2.5             | PostgreSQL 15+ (production)   |
| Tailwind CSS v4                           | Spring Security + JWT (jjwt 0.12.5)    | H2 in-memory (`dev` profile)  |
| React Router v7                           | Spring Data JPA + Hibernate            |                               |
| Axios with JWT interceptor                | Lombok, springdoc-openapi              |                               |
| Recharts (admin dashboard charts)         | Maven 3.9 (bundled in `backend/`)      |                               |

## Features

### User
- Register and sign in with email / password (JWT-secured)
- Browse the library catalog with live debounced search
- Borrow available books in one click
- View personal borrow history with overdue alerts (>14 days)
- Return borrowed books
- Edit personal profile (full name)
- View borrow statistics (total / active / returned)

### Admin
- Dashboard with KPI cards + bar chart (last-6-month activity) + pie chart (book status distribution)
- Manage book catalog (add / edit / delete) with live search and pagination
- Manage users (list, search, change role, view individual borrow history)
- View all borrow records across the system, filter by status (All / Borrowed / Returned)

## Getting Started

### Prerequisites
- **Java 17+** (or use the bundled JDK at `backend/jdk17/`)
- **Node.js 18+**
- **PostgreSQL 15+** (optional — H2 dev profile works without it)

### Backend

From the project root:

```powershell
cd backend

# Option A — PostgreSQL (production-like).
# Ensure Postgres is running and database `library_db` exists.
.\apache-maven-3.9.6\bin\mvn spring-boot:run

# Option B — H2 in-memory (no DB install needed; data resets on restart)
.\apache-maven-3.9.6\bin\mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Backend listens on `http://localhost:8080`.

Environment overrides (for production deployments):

| Variable          | Default                                          |
|-------------------|--------------------------------------------------|
| `DB_URL`          | `jdbc:postgresql://localhost:5432/library_db`    |
| `DB_USERNAME`     | `postgres`                                       |
| `DB_PASSWORD`     | `postgres`                                       |
| `JWT_SECRET`      | dev fallback in `application.properties`         |
| `JWT_EXPIRATION`  | `86400000` (24 h, in ms)                         |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` (next free port if taken). API base URL is read from `frontend/.env` (`VITE_API_BASE_URL=http://localhost:8080/api`).

### Default Credentials

Seeded automatically by `DataSeeder.java` on first run:

| Role  | Email                | Password   | Notes                                              |
|-------|----------------------|------------|----------------------------------------------------|
| Admin | admin@library.com    | admin123   | Role is restored on startup if accidentally demoted |
| User  | user1@library.com    | user123    | Alice Johnson — 1 active borrow + 1 returned       |
| User  | user2@library.com    | user123    | Bob Smith — 1 overdue borrow (>14 days)            |

## API Documentation

Swagger UI is exposed while the backend is running:

```
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON: `http://localhost:8080/v3/api-docs`.

## Project Structure

```
Library_System/
├── backend/                Spring Boot service (port 8080)
│   ├── src/main/java/com/library/backend/
│   │   ├── controller/     REST controllers (Auth, Book, Borrow, Admin, User)
│   │   ├── service/        Business logic
│   │   ├── repository/     JPA repositories
│   │   ├── entity/         JPA entities (User, Book, BorrowRecord)
│   │   ├── dto/            Request / Response DTOs
│   │   ├── mapper/         Entity ↔ DTO mappers
│   │   ├── security/       JWT filter, SecurityConfig, JwtService
│   │   ├── exception/      Global exception handler + custom exceptions
│   │   └── config/         DataSeeder, OpenApi, CORS
│   ├── src/main/resources/
│   │   ├── application.properties        Postgres + JWT config
│   │   └── application-dev.properties    H2 override
│   ├── apache-maven-3.9.6/               Bundled Maven (optional)
│   └── jdk17/                            Bundled JDK17 (optional)
├── frontend/               React + Vite SPA (port 5173)
│   ├── src/
│   │   ├── api/            axios client + API wrappers
│   │   ├── components/     Layout + shared UI (Navbar, ToastContainer, ProtectedRoute)
│   │   ├── context/        AuthContext, ToastContext
│   │   ├── features/       Domain features (books, borrow, admin)
│   │   ├── hooks/          useAuth, useToast
│   │   ├── pages/          Top-level pages (Home, Login, Register, Profile)
│   │   ├── types/          Shared TypeScript types
│   │   └── utils/          Token storage helper
│   └── vite.config.ts
└── README.md
```
.\apache-maven-3.9.6\bin\mvn spring-boot:run "-Dspring-boot.run.profiles=dev"


## Author
Keneshov Aktan
