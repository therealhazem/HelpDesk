# HelpDesk Lite — State Management Strategy

---

## 1. Overview

HelpDesk Lite uses a **hybrid state model**:

| State type | Tool | Rationale |
|---|---|---|
| Server/async data | **TanStack React Query v5** | Caching, invalidation, optimistic updates |
| UI/ephemeral client state | **Zustand** | Lightweight, no boilerplate for UI toggles |
| Form state | **React Hook Form + Zod** | Validation, field-level errors |
| Auth session | **NextAuth + SessionProvider** | Secure session; minimal client exposure |
| URL-persisted filters | **nuqs** or `useSearchParams` | Shareable filter state |

**Explicit non-use:** Redux (unnecessary complexity for this scope).

---

## 2. React Query — Server State

### 2.1 Query Key Convention

```typescript
// Hierarchical keys for granular invalidation
['tickets', { filters }]              // list
['tickets', ticketId]                 // detail
['tickets', ticketId, 'comments']
['tickets', ticketId, 'history']
['board', { filters }]
['dashboard', 'employee']
['dashboard', 'agent']
['dashboard', 'manager']
['dashboard', 'operations']
['notifications', { unreadOnly }]
['verification-records', { filters }]
['verification-records', id]
['categories']
['users', { filters }]                // admin
```

### 2.2 Default Options

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s for ticket data
      gcTime: 5 * 60_000,       // 5 min cache
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

Dashboard queries: `staleTime: 60_000`.  
Categories/users: `staleTime: 300_000`.

### 2.3 Custom Hooks

| Hook | Query / Mutation | Invalidates |
|---|---|---|
| `useTickets(filters)` | GET /tickets | — |
| `useTicket(id)` | GET /tickets/:id | — |
| `useCreateTicket()` | POST /tickets | tickets, board, dashboard |
| `useUpdateTicket()` | PATCH /tickets/:id | ticket, tickets, board |
| `useTransitionTicket()` | PATCH status | ticket, tickets, board, dashboard |
| `useAssignTicket()` | POST assign | ticket, tickets, board, notifications |
| `useBlockTicket()` | POST block | ticket, tickets, board, notifications |
| `useBoard(filters)` | GET /board | — |
| `useDashboard(role)` | GET /dashboard/* | — |
| `useNotifications()` | GET /notifications | — |
| `useMarkRead()` | PATCH read | notifications |
| `useVerificationRecords()` | GET list | — |

### 2.4 Optimistic Updates

Applied to high-interaction mutations:

**Kanban status drag:**
```typescript
onMutate: async ({ ticketId, newStatus }) => {
  await queryClient.cancelQueries({ queryKey: ['board'] });
  const previous = queryClient.getQueryData(['board', filters]);
  // Move card between columns optimistically
  queryClient.setQueryData(['board', filters], optimisticBoard);
  return { previous };
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(['board', filters], context.previous);
  toast.error('Invalid transition or conflict');
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['board'] });
  queryClient.invalidateQueries({ queryKey: ['tickets'] });
},
```

**Mark notification read:** Optimistic `isRead: true` with rollback.

### 2.5 Optimistic Locking

Mutations include `expectedUpdatedAt` from last fetch. On 409 CONFLICT:
- Toast: "Ticket was updated by someone else"
- Invalidate ticket query to refetch fresh state

---

## 3. Zustand — Client UI State

### 3.1 UI Store (`src/stores/ui-store.ts`)

```typescript
interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  drawerTicketId: string | null;
  openTicketDrawer: (id: string) => void;
  closeTicketDrawer: () => void;

  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

Persisted to `localStorage`: `theme`, `sidebarOpen` (desktop preference).

### 3.2 Filter Store (`src/stores/filter-store.ts`)

```typescript
interface TicketFilters {
  search: string;
  status: TicketStatus[];
  priority: TicketPriority[];
  categoryId: string | null;
  assigneeId: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  blocked: boolean | null;
  page: number;
}

interface FilterStore {
  ticketFilters: TicketFilters;
  setTicketFilters: (partial: Partial<TicketFilters>) => void;
  resetTicketFilters: () => void;
  syncFromUrl: (params: URLSearchParams) => void;
  toUrlParams: () => URLSearchParams;
}
```

**URL sync:** On filter change, update URL via `router.replace` (shallow). On page load, hydrate store from URL.

Board page shares same filter store — changing filters on list reflects on board.

---

## 4. Form State — React Hook Form

Used for:
- Login form
- Create/edit ticket
- Comment form
- Assignment form
- Block dialog
- User/category admin forms
- Verification record form
- Evidence form

Pattern:
```typescript
const form = useForm<CreateTicketInput>({
  resolver: zodResolver(createTicketSchema),
  defaultValues: { priority: 'MEDIUM' },
});
```

Server Actions receive validated data; errors mapped via `useActionState` or manual error handling.

---

## 5. Auth Session State

```
NextAuth JWT session
  → SessionProvider (client)
  → useSession() in components for role-based UI
  → auth() on server for data fetching
```

**Decision:** Do not duplicate user in Zustand. Session is source of truth for identity/role.

UI elements hidden by role still enforced server-side.

---

## 6. Theme State

```
ThemeProvider (next-themes)
  ↔ uiStore.theme (optional sync for SSR flash prevention)
```

Dark mode via `class` strategy on `<html>`.

---

## 7. Kanban Drag State

Transient drag state managed by `@dnd-kit` internally — **not** stored in Zustand.

Only `onDragEnd` result triggers React Query mutation.

```typescript
// Local state in KanbanBoard
const [activeId, setActiveId] = useState<string | null>(null);
// Provided by DndContext callbacks — discarded after drop
```

---

## 8. Notification Bell Badge

```typescript
const { data } = useNotifications({ unreadOnly: true });
const unreadCount = data?.meta.total ?? 0;
```

Poll every 60s via React Query `refetchInterval: 60_000` on bell mount.

---

## 9. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Components                        │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
    ┌───────▼────────┐           ┌───────▼────────┐
    │  React Query   │           │    Zustand     │
    │  (server data) │           │  (UI/filters)  │
    └───────┬────────┘           └────────────────┘
            │
    ┌───────▼────────┐           ┌────────────────┐
    │  API Routes    │           │ Server Actions │
    └───────┬────────┘           └───────┬────────┘
            │                             │
            └──────────┬──────────────────┘
                       │
              ┌────────▼────────┐
              │ Domain Services │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │     Prisma      │
              └─────────────────┘
```

---

## 10. Invalidation Matrix

| Mutation | Invalidated keys |
|---|---|
| Create ticket | `tickets`, `board`, `dashboard.*` |
| Update ticket | `tickets`, `tickets:id`, `board` |
| Status transition | `tickets:id`, `tickets`, `board`, `dashboard.*` |
| Assign/reassign | `tickets:id`, `tickets`, `board`, `notifications`, `dashboard.*` |
| Block/unblock | `tickets:id`, `tickets`, `board`, `notifications`, `dashboard.*` |
| Add comment | `tickets:id`, `tickets:id:comments` |
| Mark notification read | `notifications` |
| Verification CRUD | `verification-records` |
| Admin user/category | `users`, `categories` |

Use `queryClient.invalidateQueries({ queryKey: ['dashboard'] })` prefix match for all dashboard variants.

---

## 11. SSR & Hydration

| Page | Strategy |
|---|---|
| Dashboard | Server Component prefetches dashboard query → dehydrate |
| Ticket list | Client-only (filters in URL) |
| Ticket detail | Server fetch initial ticket + hydrate comments |
| Board | Client-only (dnd requires client) |
| Login | Client form |

```typescript
// Root layout prefetch example
const queryClient = new QueryClient();
await queryClient.prefetchQuery(dashboardQueryOptions(role));
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    {children}
  </HydrationBoundary>
);
```

---

## 12. Error & Loading State Ownership

| Concern | Owner |
|---|---|
| Page-level loading | Next.js `loading.tsx` skeletons |
| Query loading | Hook `isLoading` → component skeleton |
| Query error | Hook `isError` → `<ErrorState onRetry={refetch} />` |
| Mutation error | Toast + rollback (optimistic) |
| Empty data | `<EmptyState />` in component |

---

## 13. Testing State

React Query tests use `@tanstack/react-query` test utilities:
```typescript
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
render(<QueryClientProvider client={queryClient}><Component /></QueryClientProvider>);
```

Zustand stores reset in `beforeEach` via `useUIStore.setState(initialState)`.

---

## 14. Summary

- **React Query** owns all server data — single source of truth for tickets, dashboards, notifications, governance records.
- **Zustand** owns UI chrome and filter state synced to URL.
- **React Hook Form** owns form field state with Zod validation.
- **NextAuth** owns auth session — never duplicated.
- **dnd-kit** owns ephemeral drag state — commits via React Query on drop.

This keeps business data flow predictable, testable, and aligned with Next.js App Router patterns.
