# HelpDesk Lite — Route Map & UI Sitemap

---

## 1. Route Map

| Route | Page | Roles | Description |
|---|---|---|---|
| `/login` | Login | Public | Credentials login |
| `/` | Redirect | Auth | Redirect to role dashboard |
| `/dashboard/employee` | Employee Dashboard | EMPLOYEE+ | Open/resolved stats, activity |
| `/dashboard/agent` | Agent Dashboard | AGENT+ | Assigned, blocked, overdue |
| `/dashboard/manager` | Manager Dashboard | MANAGER, ADMIN | Full metrics + charts |
| `/dashboard/operations` | Operations (MOL) | AGENT, MANAGER, ADMIN | Open/blocked/ownership |
| `/tickets` | Ticket List | ALL | Search, filter, paginate |
| `/tickets/new` | Create Ticket | EMPLOYEE+ | Intake form |
| `/tickets/[id]` | Ticket Detail | Scoped | Full ticket view |
| `/board` | Kanban Board | ALL (scoped data) | Drag-and-drop delivery board |
| `/notifications` | Notifications | ALL | In-app inbox |
| `/governance/verification` | Verification List | AGENT+ (read) | AI governance records |
| `/governance/verification/new` | New Verification | MANAGER, ADMIN | Create record |
| `/governance/verification/[id]` | Verification Detail | AGENT+ (read) | Evidence + audit |
| `/governance/audit` | Governance Audit | MANAGER, ADMIN | Audit log view |
| `/admin/users` | User Management | ADMIN | CRUD users |
| `/admin/categories` | Categories | ADMIN | CRUD categories |
| `/admin/audit` | System Audit | ADMIN | Full audit log |

---

## 2. API Route Map

See `04-api-specification.md` for full contract.

```
/api/auth/[...nextauth]/*
/api/v1/auth/session
/api/v1/users/*
/api/v1/categories/*
/api/v1/tickets/*
/api/v1/tickets/board
/api/v1/dashboard/*
/api/v1/notifications/*
/api/v1/verification-records/*
/api/v1/audit-logs
```

---

## 3. UI Sitemap (Visual)

```
HelpDesk Lite
│
├── 🔐 Login
│
└── 📊 App Shell (authenticated)
    │
    ├── Dashboards
    │   ├── Employee Home      (/dashboard/employee)
    │   ├── Agent Home         (/dashboard/agent)
    │   ├── Manager Home       (/dashboard/manager)
    │   └── Operations         (/dashboard/operations)
    │
    ├── Tickets
    │   ├── All Tickets        (/tickets)
    │   ├── New Ticket         (/tickets/new)
    │   └── Ticket Detail      (/tickets/:id)
    │
    ├── Delivery
    │   └── Kanban Board       (/board)
    │
    ├── Notifications          (/notifications)
    │
    ├── Governance
    │   ├── Verification Records   (/governance/verification)
    │   ├── New Verification       (/governance/verification/new)
    │   ├── Record Detail          (/governance/verification/:id)
    │   └── Governance Audit       (/governance/audit)
    │
    └── Admin
        ├── Users              (/admin/users)
        ├── Categories         (/admin/categories)
        └── Audit Logs         (/admin/audit)
```

---

## 4. Navigation by Role

### Employee sidebar
- My Dashboard
- My Tickets
- New Ticket
- Board (own tickets, read-only)
- Notifications

### Agent sidebar
- Agent Dashboard
- Tickets
- Board
- Operations
- Notifications
- Governance (read-only)

### Manager sidebar
- Manager Dashboard
- Tickets
- Board
- Operations
- Notifications
- Governance
- *(no Admin section)*

### Admin sidebar
- Manager Dashboard
- Tickets
- Board
- Operations
- Notifications
- Governance
- Admin (Users, Categories, Audit)

---

## 5. Default Landing Redirects

| Role | `/` redirect |
|---|---|
| EMPLOYEE | `/dashboard/employee` |
| AGENT | `/dashboard/agent` |
| MANAGER | `/dashboard/manager` |
| ADMIN | `/dashboard/manager` |

---

## 6. Middleware Guards

```typescript
// Pseudocode — implemented in src/middleware.ts

const publicRoutes = ['/login'];
const adminRoutes = ['/admin'];
const governanceWriteRoutes = ['/governance/verification/new'];
const managerRoutes = ['/dashboard/manager', '/governance/verification/new'];

// Unauthenticated → /login
// EMPLOYEE blocked from /admin, /governance/*
// AGENT blocked from /admin, governance write
// MANAGER blocked from /admin
```

---

## 7. Loading & Error Boundaries

| Route segment | loading.tsx | error.tsx |
|---|---|---|
| `(dashboard)/layout` | Skeleton shell | Retry + home link |
| `tickets/` | Table skeleton | Error state |
| `tickets/[id]/` | Detail skeleton | Not found / error |
| `board/` | Column skeletons | Error state |
| `dashboard/*/` | Widget skeletons | Partial error cards |
| `governance/*/` | Table skeleton | Error state |
| `admin/*/` | Table skeleton | Forbidden message |

---

## 8. Deep Links & URL State

| Page | Query params |
|---|---|
| `/tickets` | `?search=&status=&priority=&category=&assignee=&from=&to=&blocked=&page=` |
| `/board` | Same filter params (shared via Zustand + URL sync) |
| `/governance/verification` | `?reviewStatus=&verificationStatus=&page=` |
| `/notifications` | `?unreadOnly=true` |

Filters sync to URL for bookmarking and manager share links.

---

## 9. Mobile Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `< md` | Sidebar collapses to hamburger sheet |
| `< lg` | Kanban horizontal scroll; ticket detail single column |
| `≥ lg` | Full sidebar + two-column ticket detail |

---

## 10. Page → Data Dependencies

| Page | Primary API |
|---|---|
| Employee Dashboard | `GET /dashboard/employee` |
| Agent Dashboard | `GET /dashboard/agent` |
| Manager Dashboard | `GET /dashboard/manager` |
| Operations | `GET /dashboard/operations` |
| Ticket List | `GET /tickets` |
| Ticket Detail | `GET /tickets/:id` |
| Board | `GET /tickets/board` |
| Notifications | `GET /notifications` |
| Verification List | `GET /verification-records` |
| Verification Detail | `GET /verification-records/:id` |
