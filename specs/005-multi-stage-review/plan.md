# Implementation Plan: Phase 5 Multi-Stage Review

**Branch**: `005-multi-stage-review` | **Date**: 2026-05-14 | **Spec**: `specs/005-multi-stage-review/spec.md`

**Input**: Feature specification from `specs/005-multi-stage-review/spec.md`

**Note**: This file is created by `/speckit.plan` and captures Phase 0/Phase 1 planning artifacts.

## Summary

Replace the single-status admin review with a four-stage pipeline (Initial Screening → Technical Review → Business Impact Review → Final Decision). Admins can advance or retreat ideas one stage at a time, add stage-scoped evaluation comments, and set final Accepted/Rejected decisions. Submitters can view the current stage and admin feedback on their ideas. Draft ideas are excluded from the pipeline. All Phase 1–4 behavior is preserved.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 and React 19

**Primary Dependencies**:
- `next`, `react`, `react-dom`
- `prisma` / `@prisma/client`
- `bcrypt` for existing auth
- `tailwindcss` for existing UI styling

**Storage**: SQLite via Prisma for all entities including the new `StageComment` model and `reviewStage` enum field on `Idea`.

**Testing**: Manual validation for review stage transitions, comment visibility, submitter access, and Phase 1–4 regression, plus `npm run lint` and `npm run build` quality gates.

**Target Platform**: Browser-based local web app running on Node.js.

**Project Type**: Next.js App Router monolith with route handlers and server-rendered pages.

**Performance Goals**:
- Stage transition round-trip under 2 seconds for 95% of local attempts.
- Stage comment submission under 2 seconds for 95% of local attempts.

**Constraints**:
- Preserve all existing Phase 1–4 behavior without regression.
- Draft ideas must not appear in any review stage view.
- Admins may only transition non-final ideas one stage at a time (no skipping).
- Accepted and rejected ideas are fully immutable with respect to review stage.
- Admin identity must not be exposed in submitter-facing stage comment responses.

**Scale/Scope**:
- Single-tenant local deployment.
- Multi-stage review applies to all submitted/under_review ideas.
- Covers schema migration, two new API route handlers, extensions to one existing route, and new/updated React components for admin and submitter views.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clean Code**: Two new models (`ReviewStage` enum, `StageComment`) have single responsibilities; two new route handlers have explicit, narrowly-scoped operations; stage ordering logic is encapsulated in a single constant map. No gate violation.
- **Simple Responsive UI**: Stage progress indicator and comment list are additive, user-facing workflow elements with direct value; no decorative complexity introduced. No gate violation.
- **Minimal Dependencies**: No new packages required; existing Next.js/Prisma/Tailwind stack handles all new features. No gate violation.
- **Reusable React Components**: Review pipeline UI (stage indicator, stage comment form, stage comment list) designed as composable shared components reused across admin and submitter views. No gate violation.
- **Persistence and Accessibility**: SQLite/Prisma encapsulates all new data access; stage labels use semantic HTML; admin identity withheld from submitter responses enforces correct access control. No gate violation.

Post-design re-check: Research decisions, data model, contracts, and quickstart maintain full constitutional compliance; no exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/005-multi-stage-review/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── admin/
│   │   ├── [ideaId]/
│   │   │   ├── review-stage/
│   │   │   │   └── route.ts        # NEW: PATCH stage transition
│   │   │   ├── stage-comments/
│   │   │   │   └── route.ts        # NEW: POST stage comment
│   │   │   ├── comments/
│   │   │   │   └── route.ts        # existing — unchanged
│   │   │   └── status/
│   │   │       └── route.ts        # existing — unchanged
│   │   └── ideas/
│   │       └── route.ts            # existing — extend response with reviewStage
│   └── ideas/
│       └── [ideaId]/
│           └── route.ts            # existing — extend GET response with stage + stageComments
├── components/
│   ├── review-pipeline.tsx         # NEW: stage progress indicator
│   ├── stage-comment-form.tsx      # NEW: admin form to add stage comment
│   ├── stage-comment-list.tsx      # NEW: ordered list of stage comments (admin + submitter)
│   ├── admin-ideas-panel.tsx       # existing — add stage controls
│   └── idea-card.tsx               # existing — add stage label for submitter view

lib/
├── review-stages.ts                # NEW: stage ordering constants and transition helpers
├── auth.ts                         # existing — unchanged
├── validation.ts                   # existing — unchanged
└── prisma.ts                       # existing — unchanged

prisma/
├── schema.prisma                   # extend: ReviewStage enum, StageComment model, reviewStage on Idea
└── migrations/
    └── [timestamp]_multi_stage_review/
        └── migration.sql
```

**Structure Decision**: Extend the existing single Next.js App Router monolith with two new route handlers, three new shared React components, one new lib utility, and a Prisma schema/migration update. No new service boundary introduced.

## Complexity Tracking

No constitution violations requiring complexity exceptions.

## Implementation Notes

- `lib/review-stages.ts` defines the ordered `REVIEW_STAGES` constant and `getNextStage`/`getPreviousStage` helpers used by both new route handlers to enforce sequential-only transitions without duplicating ordinal logic.
- `PATCH /api/admin/[ideaId]/review-stage` validates direction, resolves the new stage using the helpers, checks that the idea is non-final and non-draft, and updates `reviewStage` in place.
- `POST /api/admin/[ideaId]/stage-comments` validates non-empty text and a valid stage enum value, then inserts a `StageComment` row. The response includes `adminId` for admin consumers but omits it for any submitter-facing usage.
- `GET /api/ideas/[ideaId]` is extended to include `reviewStage`, `reviewStageLabel`, and `stageComments` (without `adminId`) when the requester is the idea's owner submitter.
- `POST /api/ideas/[ideaId]/submit` (Phase 4) is updated to set `reviewStage = initial_screening` atomically with the `status = submitted` transition.
- The `admin-ideas-panel.tsx` component is extended with `ReviewPipeline` stage indicator and `StageCommentForm` for the admin idea detail view.
- The `idea-card.tsx` or submitter idea detail view is extended with a read-only `ReviewPipeline` and `StageCommentList` displaying stage label + comment text without admin identity.
- Prisma migration backfills `reviewStage = initial_screening` on existing `submitted` and `under_review` rows; `draft` rows remain `null`; `accepted`/`rejected` rows are set to `final_decision` for accurate audit trail.

## Edge Case Handling Notes

- Attempting to advance beyond `final_decision` or retreat before `initial_screening` returns a `400` with a descriptive message.
- Stage transitions on `accepted` or `rejected` ideas return `409` to distinguish "forbidden by state" from "unauthorized".
- Adding a stage comment on a draft idea returns `409`.
- `reviewStage` null check guards all admin stage UIs; draft ideas never render stage controls.
- Concurrent admin stage updates are handled by last-write-wins at the database level (SQLite); no distributed lock is required for single-tenant deployment.
