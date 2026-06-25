# HelpDesk Lite — Folder Structure

```
HelpDesk/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build
│       └── deploy.yml                # Production deploy
├── docker/
│   ├── Dockerfile                    # Multi-stage Next.js production
│   └── docker-compose.yml            # app + postgres + mailhog (dev)
├── docs/
│   ├── 01-product-decisions.md
│   ├── 02-system-architecture.md
│   ├── 03-database-erd.md
│   ├── 04-api-specification.md
│   ├── 05-folder-structure.md
│   ├── 06-component-hierarchy.md
│   ├── 07-route-map.md
│   ├── 08-rbac-matrix.md
│   ├── 09-state-management-strategy.md
│   └── deployment-guide.md           # Created in implementation phase
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                   # Generated migrations
│   └── seed.ts                         # Roles, users, categories, sample data
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx              # Centered auth layout
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + header shell
│   │   │   ├── page.tsx                # Role-based redirect
│   │   │   ├── dashboard/
│   │   │   │   ├── employee/page.tsx
│   │   │   │   ├── agent/page.tsx
│   │   │   │   ├── manager/page.tsx
│   │   │   │   └── operations/page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx            # Ticket list + filters
│   │   │   │   ├── new/page.tsx        # Create ticket
│   │   │   │   └── [id]/page.tsx       # Ticket detail
│   │   │   ├── board/
│   │   │   │   └── page.tsx            # Kanban board
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── governance/
│   │   │   │   ├── verification/
│   │   │   │   │   ├── page.tsx        # Verification list
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx   # Detail + evidence audit
│   │   │   │   └── audit/page.tsx      # Governance audit view
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       └── audit/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── v1/
│   │   │       ├── auth/session/route.ts
│   │   │       ├── users/route.ts
│   │   │       ├── users/[id]/route.ts
│   │   │       ├── categories/route.ts
│   │   │       ├── categories/[id]/route.ts
│   │   │       ├── tickets/route.ts
│   │   │       ├── tickets/board/route.ts
│   │   │       ├── tickets/[id]/route.ts
│   │   │       ├── tickets/[id]/status/route.ts
│   │   │       ├── tickets/[id]/block/route.ts
│   │   │       ├── tickets/[id]/unblock/route.ts
│   │   │       ├── tickets/[id]/assign/route.ts
│   │   │       ├── tickets/[id]/assignments/route.ts
│   │   │       ├── tickets/[id]/comments/route.ts
│   │   │       ├── tickets/[id]/comments/[commentId]/route.ts
│   │   │       ├── tickets/[id]/history/route.ts
│   │   │       ├── dashboard/
│   │   │       │   ├── employee/route.ts
│   │   │       │   ├── agent/route.ts
│   │   │       │   ├── manager/route.ts
│   │   │       │   └── operations/route.ts
│   │   │       ├── notifications/route.ts
│   │   │       ├── notifications/[id]/read/route.ts
│   │   │       ├── notifications/read-all/route.ts
│   │   │       ├── verification-records/route.ts
│   │   │       ├── verification-records/[id]/route.ts
│   │   │       ├── verification-records/[id]/evidence/route.ts
│   │   │       ├── verification-records/[id]/audit/route.ts
│   │   │       └── audit-logs/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                  # Root layout (providers)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── app-header.tsx
│   │   │   ├── nav-items.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── user-nav.tsx
│   │   ├── auth/
│   │   │   └── login-form.tsx
│   │   ├── tickets/
│   │   │   ├── ticket-table.tsx
│   │   │   ├── ticket-filters.tsx
│   │   │   ├── ticket-form.tsx
│   │   │   ├── ticket-detail.tsx
│   │   │   ├── ticket-detail-drawer.tsx
│   │   │   ├── ticket-status-badge.tsx
│   │   │   ├── ticket-priority-badge.tsx
│   │   │   ├── ticket-readiness-badge.tsx
│   │   │   ├── ticket-timeline.tsx
│   │   │   ├── ticket-comments.tsx
│   │   │   ├── ticket-assignment-form.tsx
│   │   │   ├── ticket-block-dialog.tsx
│   │   │   └── ticket-ownership-display.tsx
│   │   ├── board/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── kanban-card.tsx
│   │   │   └── kanban-filters.tsx
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx
│   │   │   ├── status-chart.tsx
│   │   │   ├── priority-chart.tsx
│   │   │   ├── workload-chart.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── overdue-list.tsx
│   │   ├── governance/
│   │   │   ├── verification-table.tsx
│   │   │   ├── verification-form.tsx
│   │   │   ├── verification-detail.tsx
│   │   │   ├── evidence-list.tsx
│   │   │   └── evidence-form.tsx
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx
│   │   │   └── notification-list.tsx
│   │   ├── admin/
│   │   │   ├── user-table.tsx
│   │   │   ├── user-form.tsx
│   │   │   ├── category-table.tsx
│   │   │   └── category-form.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── page-header.tsx
│   │       ├── search-input.tsx
│   │       └── confirm-dialog.tsx
│   ├── hooks/
│   │   ├── use-tickets.ts
│   │   ├── use-ticket.ts
│   │   ├── use-board.ts
│   │   ├── use-dashboard.ts
│   │   ├── use-notifications.ts
│   │   ├── use-verification-records.ts
│   │   └── use-debounce.ts
│   ├── lib/
│   │   ├── utils.ts                    # cn() helper
│   │   ├── constants.ts
│   │   ├── api-client.ts               # Fetch wrapper for React Query
│   │   ├── validators/
│   │   │   ├── ticket.ts
│   │   │   ├── comment.ts
│   │   │   ├── user.ts
│   │   │   ├── category.ts
│   │   │   └── verification.ts
│   │   ├── workflow/
│   │   │   ├── transitions.ts          # Transition matrix
│   │   │   └── ticket-workflow.ts      # validateTransition()
│   │   └── rbac/
│   │       ├── permissions.ts
│   │       └── scope.ts                # canAccessTicket()
│   ├── providers/
│   │   ├── query-provider.tsx          # React Query
│   │   ├── session-provider.tsx        # NextAuth
│   │   └── theme-provider.tsx          # Dark mode
│   ├── server/
│   │   ├── db.ts                       # Prisma singleton
│   │   ├── auth/
│   │   │   ├── config.ts               # NextAuth options
│   │   │   ├── session.ts              # getServerSession helpers
│   │   │   └── require-auth.ts         # requireRole(), requireSession()
│   │   ├── email/
│   │   │   └── mailer.ts
│   │   ├── actions/
│   │   │   ├── tickets.ts
│   │   │   ├── comments.ts
│   │   │   ├── users.ts
│   │   │   ├── categories.ts
│   │   │   ├── notifications.ts
│   │   │   └── verification.ts
│   │   └── services/
│   │       ├── ticket.service.ts
│   │       ├── comment.service.ts
│   │       ├── assignment.service.ts
│   │       ├── notification.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── verification.service.ts
│   │       ├── audit.service.ts
│   │       └── ticket-number.service.ts
│   ├── stores/
│   │   ├── ui-store.ts                 # Zustand: sidebar, drawer, theme prefs
│   │   └── filter-store.ts             # Zustand: ticket list filters
│   ├── types/
│   │   ├── ticket.ts
│   │   ├── user.ts
│   │   ├── dashboard.ts
│   │   ├── verification.ts
│   │   └── api.ts
│   └── middleware.ts                   # Auth + RBAC route guards
├── tests/
│   ├── unit/
│   │   ├── workflow/
│   │   ├── rbac/
│   │   └── validators/
│   ├── integration/
│   │   ├── tickets.test.ts
│   │   └── verification.test.ts
│   └── components/
│       ├── ticket-form.test.tsx
│       └── kanban-card.test.tsx
├── .env.example
├── .eslintrc.json
├── components.json                     # shadcn config
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Layer Rules

| Directory | May import from | Must NOT import |
|---|---|---|
| `app/` | components, server, lib, hooks, stores | — |
| `components/` | lib, hooks, stores, types | server/services |
| `server/services/` | server/db, lib | components, app |
| `lib/` | types only | server, components |
| `hooks/` | lib, stores, types | server/services directly |
