# Implementation Plan: Smart Submission Forms

**Branch**: `[002-smart-submission-forms]` | **Date**: 2026-05-14 | **Spec**: `specs/002-smart-submission-forms/spec.md`

**Input**: Feature specification from `specs/002-smart-submission-forms/spec.md`

**Note**: This file is created by `/speckit.plan` and captures Phase 0/Phase 1 planning artifacts.

## Summary

Extend InnovatEPAM Portal with dynamic category-driven submission fields for Technical Innovation, Process Improvement, and Client Solution while preserving all Phase 1 functionality. Persist category-specific values in a structured `customFields` object, apply category-specific server-side validation, and expose labeled dynamic field details in admin review views.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 and React 19

**Primary Dependencies**:
- `next`, `react`, `react-dom`
- `tailwindcss` and existing UI component patterns
- `prisma` / `@prisma/client`
- `bcrypt` (unchanged from Phase 1)

**Storage**: SQLite via Prisma; add structured `customFields` persistence to idea submissions.

**Testing**: Manual testing for Phase 2 (dynamic form rendering, validation behavior, and regression checks).

**Target Platform**: Local web application in browser on developer machine.

**Project Type**: Next.js App Router web application with server route handlers.

**Performance Goals**:
- Dynamic field switching should update UI immediately during category changes.
- Submission validation should return actionable feedback without perceptible delay in local use.

**Constraints**:
- Preserve Phase 1 behavior and existing routes.
- Keep dependency growth minimal.
- Enforce server-side validation for dynamic fields.
- Maintain local MVP architecture (SQLite + local uploads).

**Scale/Scope**:
- Single-tenant local MVP with one admin and multiple submitters.
- Scope limited to dynamic submission fields, validation, and admin display enhancement.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clean Code: Planned changes isolate dynamic field logic in validation and form-mapping utilities; no gate violation.
- Simple Responsive UI: Dynamic field sets are user-value-driven and maintain simple responsive layout; no gate violation.
- Minimal Dependencies: No new external library required for Phase 2 dynamic fields; no gate violation.
- Reusable React Components: Category field rendering and label mapping planned as reusable component logic; no gate violation.
- Persistence and Accessibility: SQLite persistence retained, server-side validation enforced, and field-level feedback preserved for accessibility basics; no gate violation.

Post-design re-check: No constitution violations identified in research/data-model/contracts outputs.

## Project Structure

### Documentation (this feature)

```text
specs/002-smart-submission-forms/
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
│   └── admin/ideas/route.ts
├── components/
│   ├── idea-form.tsx
│   ├── admin-ideas-panel.tsx
│   └── idea-card.tsx
├── submitter/ideas/page.tsx
└── admin/ideas/page.tsx

lib/
├── validation.ts
└── prisma.ts

prisma/
└── schema.prisma
```

**Structure Decision**: Keep the existing single Next.js App Router application and implement Phase 2 through additive updates to existing submission/admin routes, form components, and validation utilities.

## Complexity Tracking

No constitution violations requiring complexity exceptions.
