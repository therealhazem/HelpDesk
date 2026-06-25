# HelpDesk Lite — Product Decisions

> **Status:** Architecture phase (pre-implementation)  
> **Version:** 1.0  
> **Date:** 2025-06-25

---

## 1. Product Scope

HelpDesk Lite is an **internal** support ticketing workspace for a single organization. It replaces fragmented email/chat/spreadsheet workflows with a unified intake, ownership, tracking, and visibility layer.

**In scope:** Ticket lifecycle, RBAC, Kanban delivery board, dashboards, audit history, AI verification governance records, notifications.

**Explicitly out of scope:** Multi-tenancy, customer portal, knowledge base, SLA engine, approval chains, AI chatbot, AI routing, workflow designer.

---

## 2. Assumptions & Constraints

| Assumption | Decision |
|---|---|
| Single organization, single tenant | One PostgreSQL database; no tenant_id column |
| User provisioning | Admin creates users or seed script; no self-registration in MVP |
| Email delivery | SMTP via environment config; in-app notifications always stored |
| File attachments | Not in MVP; evidence stored as text/JSON URLs in verification records |
| Real-time updates | Polling via React Query (30s stale time on lists); no WebSockets in MVP |
| Timezone | All timestamps stored UTC; displayed in user's browser locale |
| Ticket numbering | Human-readable sequential prefix `HD-{YYYY}-{6-digit}` generated server-side |

---

## 3. User Roles

Four roles with hierarchical permissions (Admin ⊃ Manager ⊃ Agent capabilities where applicable):

| Role | Primary persona | Core job-to-be-done |
|---|---|---|
| **Employee** | Internal staff needing help | Submit and track own requests |
| **Agent** | Support team member | Own, resolve, and communicate on assigned tickets |
| **Manager** | Team lead / ops manager | Monitor workload, blocked items, reassign ownership |
| **Admin** | System administrator | User/role management, categories, system config |

**Decision:** Admin inherits Manager + Agent capabilities for operational convenience. Agents do **not** automatically see all tickets—only assigned + unassigned queue (Manager/Admin see all).

---

## 4. Ticket Workflow

### 4.1 Workflow Status (operational)

```
New → Assigned → In Progress → Resolved → Closed
                    ↓              ↑
                 Blocked      (unblock → prior status)
                    ↓
         Waiting For Requester → In Progress
```

**Transition rules (enforced server-side):**

| From | Allowed To |
|---|---|
| New | Assigned |
| Assigned | In Progress, Blocked |
| In Progress | Resolved, Blocked, Waiting For Requester |
| Blocked | Assigned, In Progress (restores previous status) |
| Waiting For Requester | In Progress |
| Resolved | Closed |
| Closed | *(terminal — no transitions)* |

**Decision:** Drag-and-drop on Kanban validates the same rules as API. Invalid drops revert with toast error.

**Decision:** Assigning a ticket from `New` auto-transitions to `Assigned` when an assignee is set.

**Decision:** Marking `Blocked` requires `blockerReason`. Unblocking clears reason and restores prior workflow status stored in history metadata.

### 4.2 Sprint Readiness (planning — separate dimension)

| Readiness | Meaning |
|---|---|
| Ready | Can be picked up this sprint |
| Partial | Missing info or dependencies |
| Blocked | Planning blocker (not same as workflow Blocked) |
| Not Ready | Not scoped for current sprint |

**Decision:** Readiness is editable by Agent, Manager, Admin. Employees see badge on their tickets but cannot change it.

---

## 5. Priority & Visual Treatment

| Priority | SLA hint (display only) | Visual |
|---|---|---|
| Low | 5 business days | Default card styling |
| Medium | 3 business days | Subtle accent border |
| High | 1 business day | Orange badge + border |
| Critical | Same day | Red badge, pulsing indicator, sorted to top |

**Decision:** Due date is optional on create; auto-suggested from priority but editable by Agent/Manager. Overdue = `dueDate < now()` and status not in {Resolved, Closed}.

---

## 6. Comments & Visibility

| Type | Visible to Employee | Visible to Agent/Manager/Admin |
|---|---|---|
| Public comment | Yes | Yes |
| Internal note | No | Yes |

**Decision:** Comment author and timestamp always shown. Employees can add public comments only on their own tickets.

---

## 7. Ownership Model

- Every ticket has exactly one **requester** (Employee who created it).
- **Assignee** is nullable until assigned.
- **Assignment history** is append-only via `Assignment` records + `TicketHistory` audit entries.
- Ownership (assignee name + avatar) is visible on list rows, Kanban cards, and ticket detail header.

**Decision:** Reassignment requires Agent (own ticket), Manager, or Admin. Employee cannot reassign.

---

## 8. Search & Filtering

**Search (full-text-ish):** ticket number, title, requester name/email, assignee name/email — single search box with debounced query.

**Filters:** status, priority, category, assignee, date range (created), blocked flag. Filters combine with AND logic.

**Decision:** Saved filters not in MVP. URL query params persist filter state for shareable views.

---

## 9. Dashboards

| Dashboard | Audience | Key widgets |
|---|---|---|
| Employee | Employee | Open count, resolved count, recent activity timeline |
| Agent | Agent | Assigned list, by-status chart, blocked list, overdue list |
| Manager | Manager, Admin | Totals, open/blocked, status/priority charts, agent workload bar chart, avg resolution time |
| Operations (Day 2 MOL) | Agent, Manager, Admin | Open/blocked counts, status distribution, ownership pie |

**Decision:** Default landing route is role-specific dashboard. Charts use Recharts with accessible color palette (works in dark mode).

---

## 10. Kanban Board (Day 2)

- Columns map 1:1 to workflow statuses.
- Drag-and-drop via `@dnd-kit`.
- Card always shows: ticket ID, owner, priority, status badge, blocked indicator, last updated.
- Readiness badge shown as secondary chip.

**Decision:** Employees have read-only Kanban view of own tickets only. Agents see assigned + team queue column for New. Managers see all.

---

## 11. Notifications & Automation (MOL)

In-app notifications stored in DB; optional email when SMTP configured.

| Trigger | Recipients | Channels |
|---|---|---|
| Ticket assigned | New assignee | In-app + email |
| Ticket reassigned | New assignee (+ previous assignee in-app) | In-app + email |
| Ticket blocked | Assignee + ticket requester (in-app only for requester) | In-app + email (assignee) |

**Decision:** Notification preferences not in MVP; all enabled by default.

---

## 12. AI Verification Governance (Day 3)

Separate module—not ticket AI. Tracks engineering verification of features/AI deliverables.

| Field | Purpose |
|---|---|
| Feature Name | What was built/reviewed |
| Review Status | Accepted / Needs Revision / Rejected / Rolled Back |
| Verification Status | Pending / Verified / Failed |
| Reviewer | User reference |
| Verification Notes | Free text |
| Verification Date | When verified |

**Evidence tracking:** JSON array of `{ type, content, url?, createdAt }` for test results, review notes, verification artifacts.

**Decision:** Only Manager and Admin can create/edit verification records. Agents have read-only access. Employees have no access.

---

## 13. Audit & History

Every mutation writes to `TicketHistory` (tickets) or `AuditLog` (users, verification, system).

Audited ticket events: created, assigned, reassigned, status change, priority change, blocked, unblocked, comment added, resolution, closure, readiness change.

**Decision:** Timeline is immutable; no delete of history records. Soft delete applies to tickets/users only.

---

## 14. Authentication

- **NextAuth.js v5** with Credentials provider (email + password, bcrypt hashed).
- JWT session strategy with role embedded in token (refreshed from DB on session update).
- Protected routes via middleware + server-side session checks on every mutation.

**Decision:** Password reset flow not in MVP; Admin resets via user management.

---

## 15. Data Retention & Soft Delete

- Tickets, users, categories: `deletedAt` nullable timestamp.
- Soft-deleted tickets excluded from default views; Admin can view in archive filter.
- Hard delete not exposed in UI.

---

## 16. Categories

Seed categories: IT Support, HR, Facilities, Finance, General.

Admin can CRUD categories. Tickets require valid active category.

---

## 17. Error & Empty States

Every page implements:
- **Loading:** skeleton components matching layout
- **Empty:** contextual CTA (e.g., "Create your first ticket")
- **Error:** retry action + support message

---

## 18. Testing Strategy (for implementation phase)

| Layer | Tool | Focus |
|---|---|---|
| Unit | Vitest | Workflow validators, RBAC helpers, Zod schemas |
| Component | RTL | Forms, Kanban card, comment thread |
| Integration | Vitest + test DB | API route handlers, server actions |

Target: 80%+ coverage on domain/workflow logic; smoke tests on critical paths.

---

## 19. Deployment

- Docker Compose: `app` + `postgres` + optional `mailhog` for dev email.
- Production: containerized Next.js behind reverse proxy; managed PostgreSQL.
- Migrations via `prisma migrate deploy`.

---

## 20. Open Questions (resolved for MVP)

| Question | Resolution |
|---|---|
| Can Employee close tickets? | No — only Agent+ can move to Closed after Resolved |
| Can Agent create tickets on behalf of others? | Yes — requester selectable by Agent/Manager/Admin |
| Multiple assignees? | No — single assignee; use comments for collaboration |
| Ticket editing after creation? | Employee can edit title/description before Assigned; after that Agent+ only |

---

**Next step:** Review this document + architecture artifacts. Upon approval, proceed to full implementation.
