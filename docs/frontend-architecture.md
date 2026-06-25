# HelpDesk Lite — Frontend Architecture

## Folder Structure

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Router + providers
├── index.css                # Tailwind + global styles
├── components/
│   ├── layout/              # Sidebar, Navbar, Layout shell
│   ├── ui/                  # Reusable primitives (Button, Modal, Drawer, Badge)
│   ├── tickets/             # Ticket-specific components
│   ├── board/               # Kanban board (dnd-kit)
│   ├── charts/              # Recharts dashboard widgets
│   └── governance/          # Verification records
├── pages/                   # Route-level page components
├── hooks/                   # useLocalStorage, useTickets, useDebounce
├── data/                    # constants.js, seedData.js
├── utils/                   # storage, workflow, formatters
└── context/
    └── AppContext.jsx       # Global state + Local Storage sync
```

## Component Architecture

```
Layout
├── Sidebar (nav, role switcher)
├── Navbar (search, theme toggle, user badge)
└── Outlet (pages)

Pages consume:
├── useApp() — mutations & global data
├── useScopedTickets() — role-filtered + search/filter
└── useTicketStats() — dashboard metrics
```

## State Management

| Layer | Approach |
|---|---|
| Persistent data | React Context (`AppContext`) synced to `localStorage` on every change |
| UI state | Local `useState` in components (modals, drawers, form fields) |
| Filters | Page-level state, passed to `useScopedTickets` |
| Theme | Stored in settings → applied via `document.documentElement.classList` |
| Role demo | Settings.role → filters tickets via `getTicketsForRole()` |

Storage keys: `helpdesk_lite_tickets`, `helpdesk_lite_verification`, `helpdesk_lite_settings`, `helpdesk_lite_sprint`

## UI Sitemap

```
/ → redirect to role dashboard
/dashboard/employee
/dashboard/agent
/dashboard/manager
/tickets
/tickets/new
/board
/backlog
/sprint
/governance
```
