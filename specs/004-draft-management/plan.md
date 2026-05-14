# Implementation Plan: Phase 4 Draft Management

**Branch**: `[004-draft-management]` | **Date**: 2026-05-14 | **Spec**: `specs/004-draft-management/spec.md`

**Input**: Feature specification from `specs/004-draft-management/spec.md`

**Note**: This file is created by `/speckit.plan` and captures Phase 0/Phase 1 planning artifacts.

## Summary

Add a submitter-owned draft lifecycle to InnovatEPAM Portal: allow saving and updating in-progress ideas as drafts, keep drafts private to their owners and excluded from admin queues, allow owner deletion, and support final submission that validates required data and converts the record into a normal submitted idea that is read-only for submitters.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 and React 19

**Primary Dependencies**:
- `next`, `react`, `react-dom`
- `prisma` / `@prisma/client`
- `bcrypt` for existing auth
- `tailwindcss` for existing UI styling

**Storage**: SQLite via Prisma for users/ideas/comments/attachments metadata plus local filesystem uploads for attachment binaries.

**Testing**: Manual validation for draft lifecycle and role visibility rules, plus `npm run lint` and `npm run build` quality gates.

**Target Platform**: Browser-based local web app running on Node.js.

**Project Type**: Next.js App Router monolith with route handlers and server-rendered pages.

**Performance Goals**:
- Draft save/update round-trip in under 2 seconds for 95% of local/manual attempts.
- Reopen draft-to-edit flow available in under 30 seconds for 95% of manual attempts (SC-003).

**Constraints**:
- Preserve all existing Phase 1-3 behavior without regression.
- Drafts must be visible only to owner submitter and never shown in admin review queues.
- Final submit from draft must reuse existing submission validation (including Phase 2 custom fields and Phase 3 attachments).
- Submitted ideas remain read-only for submitters.

**Scale/Scope**:
- Single-tenant local deployment.
- Draft lifecycle applies to submitter ideas only.
- Covers API, persistence model, submitter UI labeling/actions, and admin filtering behavior.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clean Code: Draft lifecycle introduces explicit state and route responsibilities (create/update/delete/submit) and avoids hidden side effects; no gate violation.
- Simple Responsive UI: Draft actions are practical workflow controls, not decorative complexity; existing dashboard patterns remain intact; no gate violation.
- Minimal Dependencies: No new package required; use existing Next.js/Prisma stack and current validation utilities; no gate violation.
- Reusable React Components: Draft/submitted distinctions are applied through existing shared cards/forms/dashboard components rather than duplicating page logic; no gate violation.
- Persistence and Accessibility: SQLite/Prisma remains the source of truth, role checks remain server-enforced, and status/action feedback stays accessible in current UI patterns; no gate violation.

Post-design re-check: Research decisions, data model, contracts, and quickstart maintain constitutional compliance with no exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/004-draft-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md             # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── ideas/route.ts
│   ├── ideas/[ideaId]/route.ts
│   ├── ideas/[ideaId]/submit/route.ts
│   ├── admin/ideas/route.ts
│   └── admin/[ideaId]/status/route.ts
├── components/
│   ├── idea-form.tsx
│   ├── submitter-dashboard.tsx
│   └── idea-card.tsx
└── submitter/ideas/page.tsx

lib/
├── auth.ts
├── validation.ts
├── category-fields.ts
└── prisma.ts

prisma/
├── schema.prisma
└── migrations/
```

**Structure Decision**: Keep the existing single Next.js App Router project and implement draft management as additive schema, API, and shared component updates without introducing a separate service boundary.

## Complexity Tracking

No constitution violations requiring complexity exceptions.

## Implementation Notes

- Added draft lifecycle endpoints under `app/api/ideas/[ideaId]/route.ts` (PATCH/DELETE) and `app/api/ideas/[ideaId]/submit/route.ts` (POST submit).
- `POST /api/ideas` now supports `submissionMode` with backward-compatible default to `final` when omitted.
- Submitter dashboard now distinguishes draft records, allows edit/delete/submit draft actions, and keeps non-draft ideas read-only.
- Admin queue endpoint excludes `draft` status records to keep in-progress ideas private.

## Edge Case Handling Notes

- Draft save allows incomplete business fields while preserving attachment type/size/count validation.
- Final draft submission runs strict validation and keeps draft editable when validation fails.
- Draft mutations return conflict responses when target idea is no longer in `draft` status.
- Owner authorization is enforced for all draft read/update/delete/submit operations.
