# HelpDesk Lite — RBAC Matrix

---

## 1. Role Hierarchy

```
ADMIN ──includes──▶ MANAGER ──includes──▶ AGENT ──includes──▶ EMPLOYEE
```

**Note:** "Includes" means higher roles inherit lower-role capabilities where applicable, plus additional permissions. Scoped data access still applies (e.g., Agent doesn't see all tickets unless Manager+).

---

## 2. Resource Access Matrix

Legend: ✅ Allowed · 🔒 Scoped · ❌ Denied · 👁 Read-only

| Resource / Action | Employee | Agent | Manager | Admin |
|---|---|---|---|---|
| **Own tickets — view** | ✅ | ✅ | ✅ | ✅ |
| **All tickets — view** | ❌ | 🔒 Assigned + NEW queue | ✅ | ✅ |
| **Create ticket (self)** | ✅ | ✅ | ✅ | ✅ |
| **Create ticket (on behalf)** | ❌ | ✅ | ✅ | ✅ |
| **Edit ticket title/desc** | 🔒 Own, before Assigned | ✅ | ✅ | ✅ |
| **Change priority** | ❌ | ✅ | ✅ | ✅ |
| **Change category** | ❌ | ✅ | ✅ | ✅ |
| **Set due date** | ❌ | ✅ | ✅ | ✅ |
| **Change readiness** | 👁 | ✅ | ✅ | ✅ |
| **Assign ticket** | ❌ | 🔒 Own queue | ✅ | ✅ |
| **Reassign ticket** | ❌ | 🔒 Own assigned | ✅ | ✅ |
| **Transition status** | ❌ | 🔒 Assigned to self | ✅ | ✅ |
| **Mark blocked** | ❌ | 🔒 Assigned to self | ✅ | ✅ |
| **Unblock** | ❌ | 🔒 Assigned to self | ✅ | ✅ |
| **Resolve / close** | ❌ | 🔒 Assigned to self | ✅ | ✅ |
| **Soft delete ticket** | ❌ | ❌ | ✅ | ✅ |
| **Public comment** | 🔒 Own tickets | ✅ | ✅ | ✅ |
| **Internal note** | ❌ | ✅ | ✅ | ✅ |
| **View internal notes** | ❌ | ✅ | ✅ | ✅ |
| **View timeline/history** | 🔒 Own tickets | 🔒 Scoped | ✅ | ✅ |
| **Kanban board** | 👁 Own | 🔒 Scoped | ✅ | ✅ |
| **Kanban drag-drop** | ❌ | 🔒 Scoped | ✅ | ✅ |
| **Employee dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Agent dashboard** | ❌ | ✅ | ✅ | ✅ |
| **Manager dashboard** | ❌ | ❌ | ✅ | ✅ |
| **Operations dashboard** | ❌ | ✅ | ✅ | ✅ |
| **Notifications** | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **Verification records — view** | ❌ | 👁 | ✅ | ✅ |
| **Verification records — create/edit** | ❌ | ❌ | ✅ | ✅ |
| **Verification evidence** | ❌ | 👁 | ✅ | ✅ |
| **Governance audit view** | ❌ | ❌ | ✅ | ✅ |
| **User management** | ❌ | ❌ | ❌ | ✅ |
| **Category management** | ❌ | ❌ | ❌ | ✅ |
| **System audit logs** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Ticket Scope Rules

### Employee
```sql
WHERE requester_id = current_user.id AND deleted_at IS NULL
```

### Agent
```sql
WHERE deleted_at IS NULL AND (
  assignee_id = current_user.id
  OR status = 'NEW'
)
```

### Manager / Admin
```sql
WHERE deleted_at IS NULL
-- Admin archive filter can include deleted
```

---

## 4. Workflow Transition Permissions

Transitions require **both** valid workflow rules AND role permission.

| Action | Minimum Role | Additional Scope |
|---|---|---|
| NEW → ASSIGNED | AGENT | Must assign to someone |
| ASSIGNED → IN_PROGRESS | AGENT | Assignee = self OR Manager+ |
| IN_PROGRESS → RESOLVED | AGENT | Assignee = self OR Manager+ |
| RESOLVED → CLOSED | AGENT | Assignee = self OR Manager+ |
| → BLOCKED | AGENT | Assignee = self OR Manager+ |
| BLOCKED → restore | AGENT | Assignee = self OR Manager+ |
| IN_PROGRESS → WAITING_FOR_REQUESTER | AGENT | Assignee = self OR Manager+ |
| WAITING → IN_PROGRESS | AGENT | Assignee = self OR Manager+ |

**Manager+ override:** Can transition any ticket regardless of assignee.

---

## 5. Field-Level Edit Matrix

| Field | Employee | Agent | Manager | Admin |
|---|---|---|---|---|
| title | Own, status=NEW | ✅ | ✅ | ✅ |
| description | Own, status=NEW | ✅ | ✅ | ✅ |
| categoryId | ❌ | ✅ | ✅ | ✅ |
| priority | ❌ | ✅ | ✅ | ✅ |
| dueDate | ❌ | ✅ | ✅ | ✅ |
| readiness | ❌ | ✅ | ✅ | ✅ |
| assigneeId | ❌ | ✅ | ✅ | ✅ |
| status | ❌ | ✅ | ✅ | ✅ |
| blockerReason | ❌ | ✅ | ✅ | ✅ |
| resolutionSummary | ❌ | ✅ | ✅ | ✅ |

---

## 6. API Endpoint RBAC Summary

| Endpoint group | EMPLOYEE | AGENT | MANAGER | ADMIN |
|---|---|---|---|---|
| `/tickets` GET | Scoped | Scoped | All | All |
| `/tickets` POST | ✅ | ✅ | ✅ | ✅ |
| `/tickets/:id` PATCH | Limited | ✅ | ✅ | ✅ |
| `/tickets/:id/status` | ❌ | Scoped | ✅ | ✅ |
| `/tickets/:id/assign` | ❌ | Scoped | ✅ | ✅ |
| `/tickets/:id/block` | ❌ | Scoped | ✅ | ✅ |
| `/tickets/:id/comments` POST | Public only | ✅ | ✅ | ✅ |
| `/dashboard/employee` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/agent` | ❌ | ✅ | ✅ | ✅ |
| `/dashboard/manager` | ❌ | ❌ | ✅ | ✅ |
| `/dashboard/operations` | ❌ | ✅ | ✅ | ✅ |
| `/verification-records` GET | ❌ | 👁 | ✅ | ✅ |
| `/verification-records` POST/PATCH | ❌ | ❌ | ✅ | ✅ |
| `/users/*` | ❌ | ❌ | ❌ | ✅ |
| `/categories/*` POST/PATCH/DELETE | ❌ | ❌ | ❌ | ✅ |
| `/audit-logs` | ❌ | ❌ | ❌ | ✅ |

---

## 7. Server-Side Enforcement Points

1. **`middleware.ts`** — Route-level role allowlists
2. **`requireRole(['AGENT'])`** — Handler entry guard
3. **`canAccessTicket(user, ticket)`** — Resource scope check
4. **`canTransition(user, ticket, newStatus)`** — Workflow + ownership
5. **`filterCommentsByRole(user, comments)`** — Strip internal notes for Employee

**Never rely on UI hiding alone.**

---

## 8. Implementation Helpers

```typescript
// src/lib/rbac/permissions.ts
hasRole(user, 'MANAGER')           // hierarchy-aware
canManageUsers(user)               // ADMIN only
canWriteVerification(user)         // MANAGER+
canDragOnBoard(user, ticket)       // scope check

// src/lib/rbac/scope.ts
getTicketListScope(user)           // Prisma where clause
canAccessTicket(user, ticket)
canEditField(user, ticket, field)
```

---

## 9. Test Cases (implementation phase)

| Scenario | Expected |
|---|---|
| Employee GET /tickets | Only own tickets returned |
| Employee POST internal comment | 403 |
| Agent PATCH ticket not assigned | 403 unless NEW queue assign |
| Agent reassign any ticket | 403 |
| Manager view all tickets | 200 with full list |
| Employee access /admin/users | Middleware redirect 403 |
| Agent POST verification-records | 403 |
| Manager DELETE ticket | 200 soft delete |
