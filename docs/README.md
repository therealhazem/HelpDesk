# HelpDesk Lite — Architecture Index

> **Phase:** Pre-implementation architecture  
> **Approval required before coding**

---

## Deliverables Checklist

| # | Deliverable | Location | Status |
|---|---|---|---|
| 1 | Product Decisions | [01-product-decisions.md](./01-product-decisions.md) | ✅ Complete |
| 2 | System Architecture | [02-system-architecture.md](./02-system-architecture.md) | ✅ Complete |
| 3 | Database ERD | [03-database-erd.md](./03-database-erd.md) | ✅ Complete |
| 4 | Prisma Schema | [../prisma/schema.prisma](../prisma/schema.prisma) | ✅ Complete |
| 5 | API Specification | [04-api-specification.md](./04-api-specification.md) | ✅ Complete |
| 6 | Folder Structure | [05-folder-structure.md](./05-folder-structure.md) | ✅ Complete |
| 7 | Component Hierarchy | [06-component-hierarchy.md](./06-component-hierarchy.md) | ✅ Complete |
| 8 | Route Map & UI Sitemap | [07-route-map.md](./07-route-map.md) | ✅ Complete |
| 9 | RBAC Matrix | [08-rbac-matrix.md](./08-rbac-matrix.md) | ✅ Complete |
| 10 | State Management Strategy | [09-state-management-strategy.md](./09-state-management-strategy.md) | ✅ Complete |

---

## Implementation Phase (after approval)

1. Full Next.js application scaffold
2. Prisma migrations + seed data
3. Unit tests (Vitest) — workflow, RBAC, validators
4. Integration tests — API routes
5. Component tests — RTL
6. Docker Compose configuration
7. `.env.example`
8. Production deployment guide

---

## Key Architectural Decisions Summary

- **Modular monolith** on Next.js 15 App Router
- **Single-tenant** PostgreSQL with soft deletes
- **Defense-in-depth RBAC** — middleware + handler + domain scope
- **Validated workflow state machine** shared by API and Kanban DnD
- **Separate readiness dimension** from workflow status
- **Immutable audit trails** for tickets and governance
- **React Query + Zustand hybrid** for server vs UI state
- **AI Governance module** isolated from ticket domain

---

## Review Questions for Stakeholders

1. Confirm seed user accounts and default passwords approach for internal deployment
2. Confirm SMTP provider for production notification emails
3. Confirm whether Agents should see the NEW (unassigned) queue — **currently: yes**
4. Confirm Employee cannot close tickets — **currently: Agent+ only**

---

**Reply with approval or requested changes to proceed with full implementation.**
