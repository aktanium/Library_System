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
- Tailwind CSS v4 (with dark mode via `dark:` classes; toggled by ThemeContext)
- React Router v7
- Axios with JWT interceptor (`src/api/axiosClient.ts`)
- React Context: AuthContext, ToastContext, ThemeContext
- Recharts for dashboard charts
- Base URL: `VITE_API_BASE_URL=http://localhost:8080/api`

## Run Commands (from backend/ folder)
```powershell
# PostgreSQL mode
.\apache-maven-3.9.6\bin\mvn spring-boot:run

# H2 dev mode (no PostgreSQL needed)
.\apache-maven-3.9.6\bin\mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Toolchain note: Lombok in pom.xml is incompatible with JDK 25+; develop on JDK 17 or 21.

## Default Credentials
- Admin: `admin@library.com` / `admin123`
- Demo users: `user1@library.com` / `user123` (Alice), `user2@library.com` / `user123` (Bob)
- Seeded by `DataSeeder.java` on first run (includes 10 books, sample borrows, sample notifications)

## Feature Surface
- **Auth**: login, register, JWT token
- **Books**: catalog browse, search, borrow, wishlist toggle, ratings, book detail modal with reviews
- **Borrow**: my history (with overdue alert banner), admin all-borrows view
- **Wishlist**: per-user bookmark list, borrow-from-wishlist
- **Reviews**: 1-5 stars + comment, one review per (user, book) after RETURNED record exists; `/api/reviews/averages` powers catalog stars
- **Notifications**: bell + unread-count badge in navbar, polled every 60s, mark-one / mark-all-read
- **Admin dashboard**: 5 stat cards (Total / Available / Borrowed / Users / Overdue), 6-month borrow bar chart, status pie chart, recent activity table
- **Admin books**: CRUD with description, summary, publishedYear, coverColor
- **Profile**: per-user name edit + borrow stats, AuthContext fallback if backend unavailable

## Key Conventions
- All API responses use consistent `ErrorResponse` shape
- Auth token stored in localStorage via `src/utils/token.ts`
- Toast notifications via `useToast()` hook — never `alert()`
- Protected routes via `<ProtectedRoute>` (optional `requireAdmin`)
- Feature folders: `src/features/{books,borrow,admin,wishlist,reviews,notifications}/`
- Dates formatted as `19 May 2026` (en-GB short)

## Dashboard Borrow-Count Rule
"Borrowed Books" is **active BorrowRecords** (`countByStatus(BORROWED)`), NOT `Book.status=BORROWED`.
Reason: a multi-copy book stays `Book.status=AVAILABLE` as long as `quantity > 0`, so counting by book-status undercounts active loans.

## Overdue Rule
Borrow is overdue when `status=BORROWED` AND `borrowDate < now - 14 days`. Computed in:
- Backend: `BorrowRecordRepository.countOverdue(cutoff)` used by `AdminService.getDashboard()`
- Frontend: `BorrowHistoryPage.isOverdue()` for per-row badge + alert banner
