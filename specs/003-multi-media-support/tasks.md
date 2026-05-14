# Tasks: Phase 3 Multi-Media Support

**Input**: Design documents from `/specs/003-multi-media-support/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: No automated test tasks are included because the specification does not explicitly require TDD or new automated test suites; manual validation tasks are included in the polish phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce shared configuration/constants and attachment utility scaffolding used across stories.

- [X] T001 Add configurable attachment cap default and export in lib/db.ts
- [X] T002 [P] Create attachment helper utilities for MIME and preview eligibility in lib/attachments.ts
- [X] T003 [P] Add attachment metadata types for API/UI contracts in lib/attachments.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete schema, migration, and shared validation/auth foundations before user story work.

**CRITICAL**: User story implementation starts only after this phase is complete.

- [X] T004 Update Idea and Attachment relation to one-to-many with displayOrder in prisma/schema.prisma
- [X] T005 Create Prisma migration for attachment cardinality and order constraints in prisma/migrations/20260514_multi_media_support/migration.sql
- [X] T006 Regenerate Prisma client for new attachment model shape in prisma/schema.prisma
- [X] T007 [P] Extend validateIdeaInput for multi-file optional attachments and cap enforcement in lib/validation.ts
- [X] T008 [P] Add reusable authorization guard for attachment owner/admin checks in lib/auth.ts
- [X] T009 [P] Add server-side attachment normalization mapper used by submitter/admin APIs in lib/attachments.ts

**Checkpoint**: Foundation complete; US1, US2, and US3 can proceed.

---

## Phase 3: User Story 1 - Submit Multiple Files With Control (Priority: P1) 🎯 MVP

**Goal**: Submitters can select multiple attachments, remove files before submit, and persist only remaining files in one atomic final submission.

**Independent Test**: Login as submitter, select multiple valid files, remove one pre-submit, submit successfully, and verify ordered persisted attachments match remaining files.

### Implementation for User Story 1

- [X] T010 [US1] Refactor submit form state from single file to multi-file selection/removal UX in app/components/idea-form.tsx
- [X] T011 [US1] Add client-side attachment cap and per-file validation feedback in app/components/idea-form.tsx
- [X] T012 [US1] Send repeated attachment form-data parts and preserve submit order in app/components/idea-form.tsx
- [X] T013 [US1] Parse and validate multiple attachment inputs (including zero-file submit) in app/api/ideas/route.ts
- [X] T014 [US1] Implement atomic file persistence and Prisma transaction for idea plus attachments in app/api/ideas/route.ts
- [X] T015 [US1] Persist attachment displayOrder and map submitter API response to attachments[] in app/api/ideas/route.ts
- [X] T016 [US1] Update submitter-side idea rendering for attachments list output in app/components/idea-card.tsx
- [X] T017 [US1] Align submitter dashboard data usage with attachments[] response shape in app/components/submitter-dashboard.tsx

**Checkpoint**: User Story 1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Review and Access All Attachments (Priority: P1)

**Goal**: Admins can view every attachment on an idea and authorized users can download each attachment securely.

**Independent Test**: Open admin idea list for a submission with multiple attachments; verify all attachments are listed and each file downloads via secure endpoint.

### Implementation for User Story 2

- [X] T018 [US2] Add secure attachment download route with owner/admin authorization in app/api/attachments/[attachmentId]/route.ts
- [X] T019 [US2] Return admin idea payload with ordered attachments and downloadUrl fields in app/api/admin/ideas/route.ts
- [X] T020 [US2] Return submitter idea payload with ordered attachments and downloadUrl fields in app/api/ideas/route.ts
- [X] T021 [US2] Replace single-attachment UI block with multi-attachment list and download links in app/components/idea-card.tsx
- [X] T022 [US2] Update admin panel typing/usage for attachments[] records in app/components/admin-ideas-panel.tsx
- [X] T023 [US2] Enforce forbidden response behavior for unauthorized attachment access in app/api/attachments/[attachmentId]/route.ts

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Image Preview for Faster Review (Priority: P2)

**Goal**: Admins see simple thumbnail previews for image attachments while non-image files remain standard downloadable entries.

**Independent Test**: Submit PNG/JPG/JPEG and non-image files, then verify admin view shows thumbnails only for image MIME types.

### Implementation for User Story 3

- [X] T024 [US3] Add previewUrl mapping for image attachments in admin API response in app/api/admin/ideas/route.ts
- [X] T025 [US3] Add previewUrl mapping for image attachments in submitter API response in app/api/ideas/route.ts
- [X] T026 [US3] Render image thumbnails with accessible alt text for preview-eligible attachments in app/components/idea-card.tsx
- [X] T027 [US3] Keep non-image attachments in link-only presentation without thumbnails in app/components/idea-card.tsx

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete regression validation, documentation sync, and final quality checks.

- [X] T028 [P] Update feature quickstart validation notes to reflect implemented endpoints and UI behavior in specs/003-multi-media-support/quickstart.md
- [ ] T029 Run manual regression checklist for Phase 1 and Phase 2 compatibility in specs/003-multi-media-support/quickstart.md
- [X] T030 Run lint/build validation and record results in specs/003-multi-media-support/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-5): Depend on Foundational completion.
- Polish (Phase 6): Depends on completion of selected user stories.

### User Story Dependencies

- US1 (P1): Starts after Foundational; no dependency on other stories.
- US2 (P1): Starts after Foundational; can run in parallel with US1, but full validation benefits from US1 completion.
- US3 (P2): Depends on US2 attachment list/rendering surface and can start after US2 base payload/UI tasks.

### Suggested Completion Order

1. Phase 1
2. Phase 2
3. US1 (MVP)
4. US2
5. US3
6. Phase 6 polish

---

## Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T007, T008, and T009 can run in parallel after T004-T006.
- After Foundational completion, US1 and US2 can be staffed in parallel.
- Within US3, T024 and T025 can run in parallel before T026/T027.
- In Polish, T028 can run in parallel with implementation closeout before T029/T030.

---

## Parallel Example: User Story 1

```bash
# Parallelizable setup around US1 implementation
Task: "T016 [US1] Update submitter-side idea rendering for attachments list output in app/components/idea-card.tsx"
Task: "T017 [US1] Align submitter dashboard data usage with attachments[] response shape in app/components/submitter-dashboard.tsx"
```

## Parallel Example: User Story 2

```bash
# Parallelizable API adaptation after secure route skeleton exists
Task: "T019 [US2] Return admin idea payload with ordered attachments and downloadUrl fields in app/api/admin/ideas/route.ts"
Task: "T020 [US2] Return submitter idea payload with ordered attachments and downloadUrl fields in app/api/ideas/route.ts"
```

## Parallel Example: User Story 3

```bash
# Parallelizable response mapping changes
Task: "T024 [US3] Add previewUrl mapping for image attachments in admin API response in app/api/admin/ideas/route.ts"
Task: "T025 [US3] Add previewUrl mapping for image attachments in submitter API response in app/api/ideas/route.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete US1 (Phase 3).
4. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver MVP with US1.
2. Add US2 for admin review/download completeness.
3. Add US3 for preview enhancement.
4. Run polish and regression checks.

### Team Parallelization Strategy

1. One developer completes schema/foundation tasks.
2. Then split by story:
- Developer A: US1 submitter workflow.
- Developer B: US2 secure download/admin visibility.
- Developer C: US3 thumbnail preview.
