# Implementation Plan: Phase 3 Multi-Media Support

**Branch**: `[003-smart-submission-forms]` | **Date**: 2026-05-14 | **Spec**: `specs/003-multi-media-support/spec.md`

**Input**: Feature specification from `specs/003-multi-media-support/spec.md`

**Note**: This file is created by `/speckit.plan` and captures Phase 0/Phase 1 planning artifacts.

## Summary

Extend InnovatEPAM Portal with Phase 3 multi-media support by converting idea attachments from single-file to multi-file, adding pre-submit file removal, enforcing submit-time atomic persistence, and enabling admin thumbnail previews and secure download access. Keep existing file type/size validation and preserve all Phase 1 and Phase 2 workflows.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 and React 19

**Primary Dependencies**:
- `next`, `react`, `react-dom`
- `prisma` / `@prisma/client`
- `tailwindcss` (existing styling stack)
- Node.js built-ins (`fs/promises`, `path`, `crypto`) for file handling

**Storage**: SQLite via Prisma for metadata + local filesystem upload storage for binary files.

**Testing**: Manual testing for Phase 3 flows plus regression checks, with `npm run lint` and `npm run build` as quality gates.

**Target Platform**: Local web application in browser on developer machine.

**Project Type**: Next.js App Router web application with route handlers.

**Performance Goals**:
- Admin attachment download should complete within 10 seconds for 95% of local/manual attempts (SC-003).
- Thumbnail previews should render for 95% of supported image attachments in admin review (SC-004).

**Constraints**:
- Preserve existing allowed MIME types and max size rule per attachment.
- Enforce configurable attachment count cap (default 10).
- Upload only on final submit, not at selection time.
- Apply atomic persistence for idea + attachments.
- Restrict downloads to admin users and idea owner submitter.
- Maintain compatibility with existing Phase 1 and Phase 2 behavior.

**Scale/Scope**:
- Single-tenant local MVP.
- Up to configured 10 attachments per submission by default.
- Scope limited to submission, persistence, admin review, and secure retrieval of attachments.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clean Code: Attachment logic is split across validation, API handlers, and presentational components with clear boundaries; no gate violation.
- Simple Responsive UI: Multi-file selection/removal and thumbnail display are directly user-value features and stay within current simple responsive layout patterns; no gate violation.
- Minimal Dependencies: Implementation uses current dependencies and native browser/Node capabilities; no new package required; no gate violation.
- Reusable React Components: Attachment rendering can be handled in shared card/list display components instead of page-specific duplication; no gate violation.
- Persistence and Accessibility: SQLite remains source of metadata truth, storage access stays server-mediated, and form-level/field-level feedback remains accessible; no gate violation.

Post-design re-check: Research, data model, contracts, and quickstart keep all constitution principles satisfied with no exception required.

## Project Structure

### Documentation (this feature)

```text
specs/003-multi-media-support/
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
│   ├── admin/ideas/route.ts
│   └── attachments/[attachmentId]/route.ts   # planned secure file access route
├── components/
│   ├── idea-form.tsx
│   ├── idea-card.tsx
│   └── admin-ideas-panel.tsx
└── submitter/ideas/page.tsx

lib/
├── auth.ts
├── db.ts
├── validation.ts
└── prisma.ts

prisma/
├── schema.prisma
└── migrations/
```

**Structure Decision**: Keep the existing single Next.js App Router application and implement Phase 3 with additive updates to Prisma schema/migrations, submission and admin API routes, and shared UI components for multi-attachment rendering.

## Complexity Tracking

No constitution violations requiring complexity exceptions.
