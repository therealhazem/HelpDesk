# HelpDesk Lite — API Specification

> REST Route Handlers under `/api/v1` + Server Actions  
> All endpoints require authentication unless noted.  
> Errors: `{ error: { code, message, details? } }` with appropriate HTTP status.

---

## 1. Conventions

| Item | Standard |
|---|---|
| Base path | `/api/v1` |
| Content-Type | `application/json` |
| Auth | NextAuth session cookie / Bearer not used in MVP |
| Pagination | `?page=1&limit=25` → `{ data, meta: { page, limit, total, totalPages } }` |
| Sorting | `?sort=createdAt&order=desc` |
| Timestamps | ISO 8601 UTC strings |
| IDs | UUID v4 |

---

## 2. Authentication

### POST `/api/auth/callback/credentials`
Handled by NextAuth — not custom implementation.

### POST `/api/auth/signout`
NextAuth sign out.

### GET `/api/v1/auth/session`
Returns current session user.

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "agent@company.com",
    "name": "Jane Agent",
    "role": "AGENT"
  }
}
```

---

## 3. Users (Admin)

### GET `/api/v1/users`
**Roles:** ADMIN  
**Query:** `?role=AGENT&search=jane&page=1`

### POST `/api/v1/users`
**Roles:** ADMIN

**Body:**
```json
{
  "email": "new@company.com",
  "name": "New User",
  "password": "securePassword1",
  "role": "EMPLOYEE"
}
```

### PATCH `/api/v1/users/:id`
**Roles:** ADMIN — update name, role, active status

### DELETE `/api/v1/users/:id`
**Roles:** ADMIN — soft delete

---

## 4. Categories

### GET `/api/v1/categories`
**Roles:** ALL authenticated  
Returns active categories (Admin sees inactive with `?includeInactive=true`)

### POST `/api/v1/categories`
**Roles:** ADMIN

### PATCH `/api/v1/categories/:id`
**Roles:** ADMIN

### DELETE `/api/v1/categories/:id`
**Roles:** ADMIN — soft delete

---

## 5. Tickets

### GET `/api/v1/tickets`
**Roles:** Scoped by RBAC

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| search | string | Ticket #, title, requester, assignee |
| status | TicketStatus[] | Comma-separated |
| priority | TicketPriority[] | Comma-separated |
| categoryId | uuid | Category filter |
| assigneeId | uuid | Assignee filter |
| requesterId | uuid | Requester filter |
| blocked | boolean | Blocked flag |
| createdFrom | ISO date | Start of range |
| createdTo | ISO date | End of range |
| page, limit | number | Pagination |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "ticketNumber": "HD-2025-000042",
      "title": "VPN not connecting",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "readiness": "READY",
      "isBlocked": false,
      "category": { "id": "uuid", "name": "IT Support" },
      "requester": { "id": "uuid", "name": "Bob Employee", "email": "bob@company.com" },
      "assignee": { "id": "uuid", "name": "Jane Agent", "email": "jane@company.com" },
      "dueDate": "2025-06-26T00:00:00.000Z",
      "createdAt": "2025-06-24T10:00:00.000Z",
      "updatedAt": "2025-06-25T08:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 142, "totalPages": 6 }
}
```

### POST `/api/v1/tickets`
**Roles:** EMPLOYEE+

**Body:**
```json
{
  "title": "VPN not connecting",
  "description": "Cannot connect since this morning...",
  "categoryId": "uuid",
  "priority": "HIGH",
  "requesterId": "uuid"
}
```
`requesterId` optional for Employee (defaults to self); required for Agent creating on behalf.

**Response 201:** Full ticket object + `Location` header

### GET `/api/v1/tickets/:id`
**Roles:** Scoped — Employee own tickets only

**Response 200:** Ticket with comments (filtered by role), assignment history, timeline

### PATCH `/api/v1/tickets/:id`
**Roles:** Scoped

**Body (partial):**
```json
{
  "title": "Updated title",
  "description": "...",
  "priority": "CRITICAL",
  "categoryId": "uuid",
  "dueDate": "2025-06-27T00:00:00.000Z",
  "readiness": "READY",
  "resolutionSummary": "Reset VPN credentials"
}
```

Field-level RBAC enforced server-side.

### DELETE `/api/v1/tickets/:id`
**Roles:** MANAGER, ADMIN — soft delete

---

## 6. Ticket Workflow

### PATCH `/api/v1/tickets/:id/status`
**Roles:** AGENT+ (scoped)

**Body:**
```json
{
  "status": "IN_PROGRESS",
  "expectedUpdatedAt": "2025-06-25T08:30:00.000Z"
}
```

Validates transition matrix. Returns 409 if optimistic lock fails.

**Errors:**
- `400 INVALID_TRANSITION` — workflow rule violation
- `409 CONFLICT` — stale updatedAt

### POST `/api/v1/tickets/:id/block`
**Roles:** AGENT+ (scoped)

**Body:**
```json
{
  "blockerReason": "Waiting for vendor API access",
  "expectedUpdatedAt": "..."
}
```

Sets status to BLOCKED, stores prior status.

### POST `/api/v1/tickets/:id/unblock`
**Roles:** AGENT+ (scoped)

**Body:**
```json
{
  "expectedUpdatedAt": "..."
}
```

Restores status from `statusBeforeBlock`.

---

## 7. Assignment

### POST `/api/v1/tickets/:id/assign`
**Roles:** AGENT (own queue), MANAGER, ADMIN

**Body:**
```json
{
  "assigneeId": "uuid",
  "note": "Reassigned due to specialization",
  "expectedUpdatedAt": "..."
}
```

Side effects:
- Creates Assignment record
- TicketHistory ASSIGNED/REASSIGNED
- Notification to assignee (+ email)
- Auto-transition NEW → ASSIGNED if applicable

### GET `/api/v1/tickets/:id/assignments`
**Roles:** AGENT+ (scoped)

Returns assignment history array.

---

## 8. Comments

### GET `/api/v1/tickets/:id/comments`
**Roles:** Scoped — Employee sees PUBLIC only

### POST `/api/v1/tickets/:id/comments`
**Roles:** Scoped

**Body:**
```json
{
  "content": "Please try restarting the VPN client.",
  "type": "PUBLIC"
}
```

Employee: `type` forced to PUBLIC.  
Agent+: PUBLIC or INTERNAL.

### DELETE `/api/v1/tickets/:id/comments/:commentId`
**Roles:** Author or ADMIN — soft delete

---

## 9. Ticket History (Timeline)

### GET `/api/v1/tickets/:id/history`
**Roles:** Scoped

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "STATUS_CHANGED",
      "actor": { "id": "uuid", "name": "Jane Agent" },
      "metadata": { "from": "ASSIGNED", "to": "IN_PROGRESS" },
      "createdAt": "2025-06-24T11:00:00.000Z"
    }
  ]
}
```

---

## 10. Kanban Board

### GET `/api/v1/tickets/board`
**Roles:** Scoped

**Query:** Same filters as list endpoint

**Response 200:**
```json
{
  "columns": {
    "NEW": [ /* ticket cards */ ],
    "ASSIGNED": [],
    "IN_PROGRESS": [],
    "BLOCKED": [],
    "WAITING_FOR_REQUESTER": [],
    "RESOLVED": [],
    "CLOSED": []
  }
}
```

Card shape (minimal):
```json
{
  "id": "uuid",
  "ticketNumber": "HD-2025-000042",
  "title": "VPN not connecting",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "readiness": "READY",
  "isBlocked": false,
  "assignee": { "id": "uuid", "name": "Jane Agent" },
  "updatedAt": "2025-06-25T08:30:00.000Z"
}
```

---

## 11. Dashboards

### GET `/api/v1/dashboard/employee`
**Roles:** EMPLOYEE+

```json
{
  "openCount": 3,
  "resolvedCount": 12,
  "recentActivity": [ /* history entries for user's tickets */ ]
}
```

### GET `/api/v1/dashboard/agent`
**Roles:** AGENT+

```json
{
  "assignedCount": 8,
  "byStatus": { "ASSIGNED": 2, "IN_PROGRESS": 5, "BLOCKED": 1 },
  "blockedTickets": [ /* ticket summaries */ ],
  "overdueTickets": [ /* ticket summaries */ ]
}
```

### GET `/api/v1/dashboard/manager`
**Roles:** MANAGER, ADMIN

```json
{
  "totalTickets": 250,
  "openTickets": 45,
  "blockedTickets": 6,
  "byStatus": { /* all statuses */ },
  "byPriority": { "LOW": 10, "MEDIUM": 20, "HIGH": 12, "CRITICAL": 3 },
  "agentWorkload": [ { "agentId": "uuid", "name": "Jane", "count": 8 } ],
  "avgResolutionHours": 18.5
}
```

### GET `/api/v1/dashboard/operations`
**Roles:** AGENT, MANAGER, ADMIN

Minimum Operating Layer metrics:
```json
{
  "openTickets": 45,
  "blockedTickets": 6,
  "byStatus": {},
  "ownershipDistribution": [ { "assigneeId": "uuid", "name": "Jane", "count": 8 } ]
}
```

---

## 12. Notifications

### GET `/api/v1/notifications`
**Roles:** ALL — current user's inbox

**Query:** `?unreadOnly=true&page=1`

### PATCH `/api/v1/notifications/:id/read`
**Roles:** Owner

### POST `/api/v1/notifications/read-all`
**Roles:** Owner

---

## 13. AI Verification Governance

### GET `/api/v1/verification-records`
**Roles:** AGENT (read), MANAGER, ADMIN

**Query:** `?reviewStatus=ACCEPTED&verificationStatus=PENDING`

### POST `/api/v1/verification-records`
**Roles:** MANAGER, ADMIN

**Body:**
```json
{
  "featureName": "AI Email Classifier v2",
  "reviewStatus": "NEEDS_REVISION",
  "verificationStatus": "PENDING",
  "reviewerId": "uuid",
  "verificationNotes": "Pending load test results",
  "verificationDate": null
}
```

### GET `/api/v1/verification-records/:id`
**Roles:** AGENT+ (read)

### PATCH `/api/v1/verification-records/:id`
**Roles:** MANAGER, ADMIN

### POST `/api/v1/verification-records/:id/evidence`
**Roles:** MANAGER, ADMIN

**Body:**
```json
{
  "type": "TEST_RESULT",
  "content": "All 42 integration tests passed",
  "url": "https://ci.company.com/build/123"
}
```

Appends to `evidence` JSON array.

### GET `/api/v1/verification-records/:id/audit`
**Roles:** MANAGER, ADMIN

Returns AuditLog entries for this record.

### DELETE `/api/v1/verification-records/:id`
**Roles:** ADMIN — soft delete

---

## 14. Audit Logs (Admin)

### GET `/api/v1/audit-logs`
**Roles:** ADMIN

**Query:** `?entityType=Ticket&entityId=uuid&page=1`

---

## 15. Server Actions

| Action | Purpose |
|---|---|
| `createTicketAction` | Employee intake form submit |
| `updateTicketAction` | Ticket detail edits |
| `assignTicketAction` | Assignment form |
| `addCommentAction` | Comment form |
| `blockTicketAction` | Block dialog |
| `unblockTicketAction` | Unblock button |
| `createUserAction` | Admin user form |
| `createVerificationRecordAction` | Governance form |
| `markNotificationReadAction` | Notification click |

Server Actions mirror API validation; prefer Actions for form UX, API for React Query.

---

## 16. HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (RBAC) |
| 404 | Not found / out of scope |
| 409 | Optimistic lock conflict |
| 422 | Business rule violation |
| 500 | Internal error |

---

## 17. Rate Limits

| Endpoint | Limit |
|---|---|
| POST login | 10/min/IP |
| POST tickets | 30/min/user |
| Other mutations | 60/min/user |
