# Library Management System — Project Context

## Location
- Windows PC: `C:\Users\admin\JavaOOP\Library_System\`
- Backend: `backend/` (Spring Boot, port 8080)
- Frontend: `frontend/` (React + Vite, port 5175)

## Tech Stack

### Backend
- Java 17, Spring Boot 3.2.5
- Spring Security + JWT (jjwt 0.12.5)
- Spring Data JPA + Hibernate
- PostgreSQL (prod) / H2 (dev profile)
- Lombok, Swagger/OpenAPI (springdoc 2.5.0)
- Package root: `com.library.backend`

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS v4
- React Router v7
- Axios with JWT interceptor (`src/api/axiosClient.ts`)
- React Context: AuthContext, ToastContext
- Base URL: `VITE_API_BASE_URL=http://localhost:8080/api`

## Run Commands (from backend/ folder)
```powershell
# PostgreSQL mode
.\apache-maven-3.9.6\bin\mvn spring-boot:run

# H2 dev mode (no PostgreSQL needed)
.\apache-maven-3.9.6\bin\mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

## Default Credentials
- Admin: `admin@library.com` / `admin123`
- Seeded by `DataSeeder.java` on first run

## Key Conventions
- All API responses use consistent `ErrorResponse` shape
- Auth token stored in localStorage via `src/utils/token.ts`
- Toast notifications via `useToast()` hook
- Protected routes via `<ProtectedRoute>` and `<AdminRoute>`
- Feature folders: `src/features/books/`, `src/features/borrow/`, `src/features/admin/`
