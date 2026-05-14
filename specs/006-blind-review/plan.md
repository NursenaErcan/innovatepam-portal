# Implementation Plan: Blind Review

**Branch**: `006-blind-review` | **Date**: 2026-05-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-blind-review/spec.md`

## Summary

Phase 6 Blind Review provides privacy-preserving idea review for admins. When an idea is in Initial Screening, Technical Review, or Business Impact Review stages, the admin review interface hides the submitter's name and email. Submitter identity becomes visible at Final Decision and after resolution (Accepted/Rejected). This is a pure rendering-layer feature that requires no schema changes—conditional hiding is applied to the existing IdeaCard and admin-ideas-panel components based on the reviewStage value. Stage comments, transitions, and end-to-end workflows remain unchanged from Phase 5.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.2.6 (Turbopack)

**Primary Dependencies**: React 19, Next.js 16.2.6, Prisma ORM, Tailwind CSS, shadcn/ui

**Storage**: SQLite via Prisma (existing; no schema changes required for this feature)

**Testing**: Jest, Playwright, manual browser testing

**Target Platform**: Web browser; Next.js server-side rendering + client interactivity

**Project Type**: Next.js web application with server-side rendering, client components for interactivity

**Performance Goals**: Instantaneous conditional rendering toggle based on reviewStage (no extra API round-trip beyond existing page load)

**Constraints**: No new database schema or migrations. Implementation is rendering-layer only. Backward-compatible with Phase 1–5 functionality.

**Scale/Scope**: Affects admin review interface (app/admin/ideas/page.tsx, admin-ideas-panel.tsx, idea-card.tsx). Submitter dashboard unaffected.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Clean Code**: Conditional rendering based on reviewStage is a simple, readable pattern. No side effects or hidden complexity. Implemented as a ternary or `showSubmitter` prop toggle in existing components—no code duplication needed.

✅ **Simple Responsive UI**: No new UI components required. Hiding/showing the submitter field is a single-line conditional in responsive layouts. Mobile-first and existing responsive behaviors carry forward unchanged.

✅ **Minimal Dependencies**: No new dependencies. Uses existing React conditional rendering patterns and Tailwind CSS display utilities (e.g., `hidden` class for submitter section).

✅ **Reusable React Components**: Leverages existing composable components: IdeaCard (showSubmitter prop), AdminIdeasPanel (passes showSubmitter based on reviewStage), StageCommentList (showAdmin prop unchanged).

✅ **Persistence and Accessibility**: No persistence changes—only rendering logic. Keyboard navigation and focus management carry forward from Phase 5. Submitter identity hiding does not degrade accessibility for admins or submitters.

**Gate Result**: PASS — No violations. No complexity tracking table needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-blind-review/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── admin/
│   └── ideas/
│       └── page.tsx                 # Admin review queue (modified to use blind review)
├── components/
│   ├── admin-ideas-panel.tsx        # Modified: check reviewStage for showSubmitter
│   ├── idea-card.tsx                # Modified: conditional submitter identity rendering
│   └── stage-comment-*.tsx          # Unchanged (comment author, not submitter identity)
└── api/
    └── admin/
        └── ideas/
            └── route.ts             # API response filtering (mask submitter if blind stage)

lib/
├── review-stages.ts                 # Existing enum (unchanged)
└── auth.ts                          # Existing auth (unchanged)

prisma/
└── schema.prisma                    # Unchanged (no schema migration)
```

**Structure Decision**: Pure Next.js web application with SSR. Blind review is implemented as a conditional rendering layer across three main components: AdminIdeasPanel (business logic for checking reviewStage), IdeaCard (visual rendering with showSubmitter toggle), and admin API endpoints (response filtering). No new directories or files required—modifications are within existing component and API route files.

## Complexity Tracking

No violations to track. Constitution Check passed with all five principles satisfied.
