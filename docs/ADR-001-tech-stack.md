# ADR-001: Technology Stack Selection

- Status: Accepted
- Date: 2026-05-14
- Context: InnovatEPAM Portal MVP (local-first, role-based submission and review workflow)

## Decision
The project uses:
- Next.js App Router
- TypeScript (strict mode)
- Tailwind CSS with shadcn/ui-style component patterns
- Prisma ORM
- SQLite

## Why Next.js App Router Was Selected
Next.js App Router was selected because it supports a full-stack web app in one codebase with server routes, server-rendered pages, and client components where needed. This fits the MVP requirement to move quickly while keeping auth, API endpoints, and UI close together.

It also aligns with the existing repository baseline and avoids migration overhead.

## Why TypeScript Was Selected
TypeScript was selected for correctness and maintainability in a role-sensitive workflow (submitter/admin, status transitions, validation). Strict typing reduces bugs in API contracts, shared models, and UI state.

Type safety is especially useful where Prisma models, route handlers, and client components share domain fields.

## Why Tailwind CSS and shadcn/ui Were Selected
Tailwind CSS was selected for fast, utility-first UI development and predictable responsive behavior without heavy custom CSS overhead. It enables shipping functional interfaces quickly, which is prioritized for MVP.

shadcn/ui-style components were selected for reusable, accessible component patterns. This supports consistent forms, cards, and controls while keeping implementation flexible and not locked into a large UI framework.

## Why Prisma ORM Was Selected
Prisma was selected for schema-first data modeling, reliable migrations, and typed query APIs. It improves developer speed and data consistency for entities such as User, Idea, Attachment, EvaluationComment, and Session.

Prisma's generated client integrates well with TypeScript and simplifies relational querying for admin dashboards and submitter views.

## Why SQLite Was Selected
SQLite was selected because the MVP is local-first and single-instance by design. It minimizes setup complexity, has low operational overhead, and is sufficient for current scale.

It allows rapid local iteration without requiring external database infrastructure.

## Tradeoffs
### Next.js App Router
- Pros:
- Unified frontend and backend development model
- Fast iteration with route handlers and server rendering
- Lower architectural overhead for MVP

- Cons:
- Can increase coupling between UI and server logic if boundaries are not maintained
- Runtime/file-tracing behavior may require attention for filesystem-heavy routes

### TypeScript
- Pros:
- Strong compile-time guarantees
- Better refactoring safety and shared contracts

- Cons:
- Additional typing effort during early prototyping
- Build/type-check feedback can slow quick experiments

### Tailwind CSS and shadcn/ui
- Pros:
- Rapid UI implementation
- Reusable and generally accessible UI building blocks

- Cons:
- Utility-heavy markup can become verbose
- Requires team discipline to keep styling patterns consistent

### Prisma ORM
- Pros:
- Typed database client and migration workflow
- Clear schema evolution path

- Cons:
- Generated client lifecycle must be managed after schema changes
- Adds abstraction overhead versus raw SQL for advanced tuning

### SQLite
- Pros:
- Simple local setup and portability
- No external service dependency

- Cons:
- Not suitable for high-concurrency, distributed production workloads
- Limited operational characteristics compared to server-based databases

## Consequences
### Positive Consequences
- Fast delivery of an end-to-end local MVP with clear role-based workflows
- Strong consistency between data model, API behavior, and UI
- Lower setup friction for contributors and reviewers

### Negative Consequences
- Architecture is optimized for local MVP, not production scale
- Future production readiness work will require upgrades in auth hardening, storage access control, and database strategy
- Team must actively manage code boundaries to avoid monolithic growth

## Follow-Up Implications
- Phase 2+: introduce middleware-centric security hardening and stronger session controls
- Phase 3+: move from public static upload access to protected download routing
- Phase 7+: evaluate migration path from SQLite to production-grade database and add CI/CD plus automated testing
