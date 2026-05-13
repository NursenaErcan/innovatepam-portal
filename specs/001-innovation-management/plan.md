# Implementation Plan: InnovatEPAM Portal

**Branch**: `[001-innovation-management]` | **Date**: 2026-05-14 | **Spec**: `specs/001-innovation-management/spec.md`

**Input**: Feature specification from `specs/001-innovation-management/spec.md`

**Note**: This file is created by `/speckit.plan` and captures Phase 0/Phase 1 planning.

## Summary

Build a local InnovatEPAM Portal MVP using Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, SQLite, bcrypt, cookie/session authentication, and local file uploads. The feature will support submitter registration, idea submission with one attachment, submitter-specific idea views, admin review of all ideas, status lifecycle updates, and evaluation comments.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 and React 19

**Primary Dependencies**:
- `next`, `react`, `react-dom`
- `tailwindcss` and `shadcn/ui` for styling and UI components
- `prisma` / `@prisma/client` for ORM and SQLite schema management
- `bcrypt` for password hashing
- built-in Next.js App Router route handlers for API and file upload handling

**Storage**: SQLite database via Prisma for users, ideas, attachments metadata, comments, and sessions. Local file attachments are stored under `public/uploads` and referenced by file path in SQLite; no protected upload route is required for Phase 1 MVP.

**Testing**: Manual testing only for Phase 1 MVP; no automated tests are required.

**Target Platform**: Local web application running in a browser on a developer machine.

**Project Type**: Web application using Next.js App Router with server-side route handlers.

**Performance Goals**: Support local workflow with fast page navigation, responsive forms, and efficient SQLite queries for hundreds of ideas. File uploads should be constrained to a local-friendly limit (e.g. 10MB per file).

**Constraints**: Must stay local-dev friendly, minimize dependencies, enforce role-based access in server routes, use cookie/session auth, and keep UI functional over polished.

**Scale/Scope**: Single-tenant local MVP with one admin account and multiple submitter accounts; suitable for a small internal pilot.

## Constitution Check

- The selected stack aligns with constitution principles: TypeScript strict mode, Tailwind CSS/shadcn/ui, SQLite persistence, minimal dependencies, reusable React components, accessibility basics, and manual local testing.
- No constitution violations are introduced by this Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/001-innovation-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md            # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── auth/
│   │   ├── register/route.ts
│   │   ├── login/route.ts
│   │   └── logout/route.ts
│   ├── ideas/route.ts
│   └── admin/
│       ├── ideas/route.ts
│       ├── [ideaId]/status/route.ts
│       └── [ideaId]/comments/route.ts
├── components/
│   ├── auth-form.tsx
│   ├── idea-card.tsx
│   ├── idea-form.tsx
│   └── status-badge.tsx
├── layout.tsx
├── page.tsx
├── login/page.tsx
├── register/page.tsx
├── submitter/
│   ├── page.tsx
│   └── ideas/page.tsx
└── admin/
    ├── page.tsx
    └── ideas/page.tsx

lib/
├── auth.ts
├── db.ts
├── prisma.ts
└── validation.ts

prisma/
├── schema.prisma

public/
└── uploads/

.next/
```

**Structure Decision**: Use the existing Next.js App Router app as a single web application. Add `lib/` for shared auth and database utilities, `prisma/` for schema management, and `public/uploads/` for local file storage.

## Complexity Tracking

No constitution gate violations were identified that require justification. The chosen architecture is intentionally simple and aligned with the MVP scope.
