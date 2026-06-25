# HelpDesk Lite — Component Hierarchy

---

## 1. Layout Shell

```
RootLayout
├── ThemeProvider
├── SessionProvider
├── QueryProvider
└── children
    │
    ├── AuthLayout (login)
    │   └── LoginForm
    │
    └── DashboardLayout
        ├── AppSidebar
        │   ├── Logo
        │   ├── NavItems (role-filtered links)
        │   └── ThemeToggle
        ├── AppHeader
        │   ├── PageTitle (breadcrumb)
        │   ├── SearchInput (global ticket search shortcut)
        │   ├── NotificationBell
        │   │   └── NotificationDropdown
        │   └── UserNav
        │       └── SignOutButton
        └── MainContent
            └── {page content}
```

---

## 2. Dashboard Pages

```
EmployeeDashboardPage
├── PageHeader
├── Grid (stats)
│   ├── StatCard (Open Tickets)
│   └── StatCard (Resolved Tickets)
└── ActivityFeed
    └── TimelineItem[]

AgentDashboardPage
├── PageHeader
├── Grid
│   ├── StatCard (Assigned)
│   └── StatCard (Blocked)
├── StatusChart (Recharts pie/bar)
├── OverdueList
│   └── TicketRow[]
└── BlockedList
    └── TicketRow[]

ManagerDashboardPage
├── PageHeader
├── Grid (4 StatCards: Total, Open, Blocked, Avg Resolution)
├── Row
│   ├── StatusChart
│   └── PriorityChart
└── WorkloadChart (bar by agent)

OperationsDashboardPage (MOL)
├── PageHeader
├── Grid (Open, Blocked)
├── Row
│   ├── StatusChart
│   └── OwnershipChart (pie)
```

---

## 3. Ticket List

```
TicketsPage
├── PageHeader
│   └── Button (New Ticket) [Employee+]
├── TicketFilters
│   ├── SearchInput
│   ├── StatusMultiSelect
│   ├── PriorityMultiSelect
│   ├── CategorySelect
│   ├── AssigneeSelect [Agent+]
│   ├── DateRangePicker
│   └── BlockedToggle
└── TicketTable
    ├── DataTable
    │   └── columns:
    │       TicketNumber, Title, Status, Priority,
    │       Category, Requester, Assignee, Updated, Actions
    └── Pagination
```

---

## 4. Create Ticket

```
NewTicketPage
├── PageHeader
└── TicketForm
    ├── Input (title)
    ├── Textarea (description)
    ├── Select (category)
    ├── Select (priority)
    ├── Select (requester) [Agent+ only]
    └── Button (submit)
```

---

## 5. Ticket Detail

```
TicketDetailPage
├── PageHeader
│   ├── TicketNumber + Title
│   ├── TicketStatusBadge
│   ├── TicketPriorityBadge
│   ├── TicketReadinessBadge
│   └── TicketOwnershipDisplay
│       ├── RequesterAvatar
│       └── AssigneeAvatar
├── Grid (2-col on desktop)
│   ├── LeftColumn
│   │   ├── Card (Description)
│   │   ├── Card (Details)
│   │   │   ├── Category, Priority, Due Date
│   │   │   ├── Blocked indicator + reason
│   │   │   └── Resolution summary
│   │   ├── TicketComments
│   │   │   ├── CommentThread
│   │   │   │   ├── PublicComment[]
│   │   │   │   └── InternalNote[] [Agent+]
│   │   │   └── CommentForm
│   │   │       └── TypeToggle [Agent+]
│   │   └── TicketTimeline
│   │       └── TimelineEvent[]
│   └── RightColumn (actions sidebar)
│       ├── TicketAssignmentForm [Agent+]
│       ├── StatusActions [Agent+]
│       │   ├── TransitionButtons
│       │   ├── TicketBlockDialog
│       │   └── UnblockButton
│       ├── ReadinessSelect [Agent+]
│       └── AssignmentHistoryList
```

---

## 6. Ticket Detail Drawer (Board quick view)

```
TicketDetailDrawer
├── Sheet (shadcn)
│   ├── Header (ID, title, badges)
│   ├── TicketOwnershipDisplay
│   ├── ScrollArea
│   │   ├── Description excerpt
│   │   ├── TicketComments (compact)
│   │   └── TicketTimeline (last 5 events)
│   └── Footer
│       ├── Link (View full detail)
│       └── QuickActions [Agent+]
```

Controlled by Zustand `uiStore.drawerTicketId`.

---

## 7. Kanban Board

```
BoardPage
├── PageHeader
├── KanbanFilters (subset of TicketFilters)
└── KanbanBoard
    ├── DndContext
    └── KanbanColumn × 7
        ├── ColumnHeader (status label + count)
        └── SortableContext
            └── KanbanCard × n
                ├── TicketNumber
                ├── Title (truncated)
                ├── TicketPriorityBadge
                ├── TicketReadinessBadge
                ├── AssigneeChip (owner)
                ├── BlockedIndicator (if blocked)
                └── RelativeTime (updatedAt)
```

**Drag flow:**
```
KanbanCard (useSortable)
  → onDragEnd in KanbanBoard
    → validateTransition()
    → PATCH /api/v1/tickets/:id/status
    → optimistic update via React Query
```

---

## 8. Governance Module

```
VerificationListPage
├── PageHeader
│   └── Button (New Record) [Manager+]
├── VerificationTable
└── Pagination

VerificationDetailPage
├── PageHeader
├── VerificationDetail
│   ├── Metadata grid
│   ├── VerificationForm (inline edit) [Manager+]
│   ├── EvidenceList
│   │   └── EvidenceItem[]
│   └── EvidenceForm [Manager+]
└── AuditTimeline (from AuditLog)

GovernanceAuditPage
├── PageHeader
└── AuditTable (verification entity filter)
```

---

## 9. Admin

```
UsersPage
├── PageHeader + UserForm (dialog)
└── UserTable

CategoriesPage
├── PageHeader + CategoryForm (dialog)
└── CategoryTable

AdminAuditPage
└── AuditTable (all entities)
```

---

## 10. Shared Primitives (shadcn/ui)

```
ui/
├── button, input, textarea, label
├── select, checkbox, switch
├── card, badge, avatar
├── dialog, sheet, dropdown-menu
├── table, tabs, separator
├── skeleton, alert
├── toast (sonner)
├── calendar (date range)
├── popover, command (combobox)
└── scroll-area
```

---

## 11. Component Data Flow

```
Server Component (page)
  → prefetch query (optional)
  → pass initialData to Client wrapper

Client Component
  → useQuery / useMutation (React Query)
  → Zustand for UI-only state (filters, drawer)
  → Server Action on form submit (alternative path)
```

---

## 12. Accessibility

- Kanban: keyboard drag alternatives via status dropdown on each card
- Charts: aria-labels + data table fallback
- All form fields: associated labels, error announcements
- Focus trap in dialogs/drawers
- Color not sole indicator for priority (icons + text)
