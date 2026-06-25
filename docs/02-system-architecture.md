# HelpDesk Lite — System Architecture

> **Status:** Architecture phase  
> **Stack:** Next.js 15 · TypeScript · PostgreSQL · Prisma · NextAuth

---

## 1. Architecture Overview

HelpDesk Lite follows a **modular monolith** pattern: a single Next.js application with clear domain boundaries, server-side enforcement of business rules, and a PostgreSQL data store.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  React 19 · Tailwind · shadcn/ui · React Query · Zustand        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                     Next.js 15 App Router                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Middleware   │  │ Server       │  │ Route Handlers       │  │
│  │ (Auth/RBAC)  │  │ Components   │  │ /api/v1/*            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Server       │  │ Domain       │  │ Infrastructure       │  │
│  │ Actions      │  │ Services     │  │ (Prisma, Email, Auth)│  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      PostgreSQL 16                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Responsibilities

### 2.1 Presentation Layer (`src/app`, `src/components`)

- Route-based pages with co-located loading/error boundaries
- Server Components for initial data fetch where beneficial
- Client Components for interactivity (Kanban, forms, charts)
- No business rule duplication—UI calls validated APIs/actions

### 2.2 Application Layer (`src/server/actions`, `src/app/api`)

- Thin orchestration: parse input → authorize → invoke domain service → return DTO
- Server Actions for form mutations from Client Components
- REST Route Handlers for React Query fetch/mutate endpoints

### 2.3 Domain Layer (`src/server/services`, `src/lib/workflow`, `src/lib/rbac`)

- Pure business logic: workflow transitions, assignment rules, audit composition
- Framework-agnostic; unit-tested without Next.js runtime

### 2.4 Infrastructure Layer (`src/server/db`, `src/server/auth`, `src/server/email`)

- Prisma client singleton
- NextAuth configuration
- Nodemailer SMTP adapter (graceful no-op when SMTP unset)

---

## 3. Request Flow

### 3.1 Authenticated Page Load

```
Browser → Middleware (session check, role route guard)
       → Server Component (getSession + prisma query)
       → HTML stream with dehydrated React Query state (where used)
       → Client hydration
```

### 3.2 Ticket Status Change (Kanban drag)

```
Client (dnd-kit) → optimistic UI update (React Query)
                 → PATCH /api/v1/tickets/:id/status
                 → auth middleware
                 → TicketWorkflowService.transition()
                 → validate RBAC + transition matrix
                 → prisma transaction (update ticket + history + notification)
                 → return updated ticket DTO
                 → React Query invalidate + reconcile
```

### 3.3 Server Action (Create Ticket)

```
Form submit → createTicketAction (Zod parse)
           → authorize EMPLOYEE+
           → TicketService.create()
           → generate ticket number
           → prisma transaction (ticket + history)
           → revalidatePath + redirect
```

---

## 4. Authentication Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Login Form  │────▶│ NextAuth     │────▶│ Users table │
│ Credentials │     │ JWT Session  │     │ bcrypt pwd  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    JWT payload:
                    { sub, email, role, name }
                           │
                    Middleware reads token
                    API routes call auth()
```

- Session max age: 8 hours (internal tool)
- CSRF protection via NextAuth built-in for Server Actions
- Role stored in JWT; refreshed on `session.update()` after role change

---

## 5. Authorization Model

Defense in depth:

1. **Middleware:** route-level role allowlists
2. **API/Action handler:** `requireRole()` + resource-level checks
3. **Domain service:** ownership/scoping rules (e.g., Employee sees own tickets only)

See `08-rbac-matrix.md` for full matrix.

---

## 6. Data Access Patterns

| Pattern | Usage |
|---|---|
| Prisma transactions | All multi-table mutations (ticket + history + notification) |
| Optimistic locking | `updatedAt` check on PATCH to prevent stale overwrites |
| Cursor pagination | Ticket lists (default 25/page) |
| Eager loading | Ticket detail includes requester, assignee, recent comments |
| Indexes | See Prisma schema — optimized for filter + search queries |

---

## 7. Caching Strategy

| Data | Strategy |
|---|---|
| Dashboard metrics | React Query, staleTime 60s, refetch on window focus |
| Ticket lists | staleTime 30s, invalidate on mutation |
| Categories/users (admin) | staleTime 5m |
| Session/user profile | Zustand + React Query hybrid |

Server-side: `unstable_cache` not used in MVP—prefer fresh data for ticket accuracy.

---

## 8. Notification Pipeline

```
Domain Event (assignment/block)
    → NotificationService.create()
        → INSERT notifications
        → EmailService.send() [if SMTP configured]
```

Async email sends wrapped in `waitUntil` (Next.js) or fire-and-forget with error logging—never block HTTP response on email failure.

---

## 9. Search Implementation

PostgreSQL `ILIKE` on indexed columns for MVP:

- `tickets.ticketNumber`
- `tickets.title`
- Joined `users.name`, `users.email` for requester/assignee

Future enhancement: full-text search via `tsvector`—not MVP.

---

## 10. Kanban Architecture

```
KanbanBoard (client)
  ├── DndContext (@dnd-kit)
  ├── Column per TicketStatus enum
  │     └── SortableContext
  │           └── TicketCard (draggable)
  └── onDragEnd → validateTransition → API PATCH
```

Board data fetched via `GET /api/v1/tickets/board?filters...` returning tickets grouped by status.

---

## 11. AI Verification Module

Isolated domain bounded context:

```
VerificationService
  ├── CRUD verification records
  ├── Append evidence entries
  └── AuditLog on all changes
```

Separate nav section: `/governance/verification`

---

## 12. Cross-Cutting Concerns

| Concern | Implementation |
|---|---|
| Validation | Zod schemas in `src/lib/validators` shared client/server |
| Logging | Structured console in dev; JSON logs in prod |
| Error handling | `AppError` class with code + HTTP status mapping |
| Audit | `AuditService.log()` called from all domain services |
| Dates | `date-fns` for formatting; store UTC in DB |

---

## 13. Security Considerations

- bcrypt cost factor 12
- HTTP-only session cookies
- Input sanitization for comment HTML (markdown plain text only in MVP)
- Rate limiting on login route (middleware, 10 req/min/IP)
- SQL injection prevented via Prisma parameterized queries
- IDOR prevention: every ticket fetch checks ownership scope

---

## 14. Environment Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `NEXTAUTH_SECRET` | JWT signing |
| `NEXTAUTH_URL` | App base URL |
| `SMTP_*` | Optional email |
| `NODE_ENV` | Environment |

---

## 15. Docker Topology

```yaml
services:
  app:      # Next.js production build
  db:       # PostgreSQL 16
  mailhog:  # Dev only — SMTP capture
```

See deployment guide (implementation phase) for production hardening.

---

## 16. Module Dependency Graph

```
app/pages
    ↓
server/actions & api/routes
    ↓
server/services (ticket, comment, notification, verification, dashboard)
    ↓
lib/workflow, lib/rbac, lib/validators
    ↓
server/db (prisma)
```

**Rule:** Domain services must not import from `app/` or `components/`.

---

## 17. Scalability Notes (future)

Current design supports ~500 users / ~50k tickets comfortably on single instance.

Horizontal scaling path:
- Read replicas for dashboard queries
- Background job queue for email (BullMQ)
- WebSocket for live board updates

Not required for MVP.
