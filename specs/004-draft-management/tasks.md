# Tasks: Phase 4 Draft Management

**Input**: Design documents from `/specs/004-draft-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Specification includes explicit independent testing criteria per story, so story-scoped manual validation tasks are included. No new automated test suite is required.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared constants and route skeletons required by draft lifecycle work.

- [X] T001 Add draft-management environment/config notes and defaults in lib/db.ts (traceability: FR-011, FR-012)
- [X] T002 [P] Add draft lifecycle API type helpers in lib/validation.ts (traceability: FR-001, FR-007, FR-008)
- [X] T003 [P] Create draft route scaffolds with app/api/ideas/[ideaId]/route.ts for draft update/delete and app/api/ideas/[ideaId]/submit/route.ts for final draft submission

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete schema and shared guardrail updates before implementing any user story behavior.

**CRITICAL**: No user story work should begin before this phase is complete.

- [X] T004 Extend IdeaStatus enum with draft state in prisma/schema.prisma
- [X] T005 Run npx prisma migrate dev --name draft-management and verify Prisma creates a timestamped migration folder automatically under prisma/migrations/
- [X] T006 Regenerate Prisma client after draft schema update using package.json scripts in package.json
- [X] T007 [P] Add shared draft ownership guard utilities in lib/auth.ts
- [X] T008 [P] Add relaxed-draft vs strict-final validation entry points in lib/validation.ts
- [X] T009 [P] Add idea status transition helper for draft-to-submitted conversion in lib/validation.ts

**Checkpoint**: Foundation complete; user stories can now be implemented.

---

## Phase 3: User Story 1 - Save and Resume Drafts (Priority: P1) 🎯 MVP

**Goal**: Submitter can save incomplete ideas as drafts, reopen them, and resave updates without duplicate records.

**Independent Test**: Save partial idea as draft, reopen later, edit, and confirm same draft record is updated.

### Tests for User Story 1

- [X] T010 [US1] Add US1 manual validation checklist steps for save/resume/resave in specs/004-draft-management/quickstart.md
- [ ] T011 [US1] Measure reopen-to-edit latency for at least 5 draft reopen attempts and record whether >=95% complete under 30 seconds in specs/004-draft-management/quickstart.md (SC-003)

### Implementation for User Story 1

- [X] T012 [US1] Add submissionMode parsing and draft-save branch in app/api/ideas/route.ts
- [X] T013 [US1] Implement relaxed draft persistence for partial payloads in app/api/ideas/route.ts
- [X] T014 [US1] Implement draft update endpoint (PATCH) with in-place save behavior in app/api/ideas/[ideaId]/route.ts
- [X] T015 [US1] Return draft ideas in submitter list payload with editable status metadata in app/api/ideas/route.ts
- [X] T016 [US1] Add Save Draft and Resume Draft form behavior in app/components/idea-form.tsx
- [X] T017 [US1] Wire draft edit action from dashboard list to form state in app/components/submitter-dashboard.tsx
- [X] T018 [US1] Distinguish draft cards from submitted cards in submitter view in app/components/idea-card.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Keep Drafts Private and Manageable (Priority: P1)

**Goal**: Drafts are owner-only, excluded from admin queues, and deletable by owner submitters.

**Independent Test**: Verify owner can see/delete draft, non-owner cannot access, and admin queue excludes drafts.

### Tests for User Story 2

- [X] T019 [US2] Add US2 manual validation checklist steps for privacy/admin exclusion/delete in specs/004-draft-management/quickstart.md

### Implementation for User Story 2

- [X] T020 [US2] Enforce submitter-owner filtering for draft retrieval in app/api/ideas/route.ts
- [X] T021 [US2] Exclude draft status from admin queue response in app/api/admin/ideas/route.ts
- [X] T022 [US2] Implement draft delete endpoint (DELETE) with owner and status guards in app/api/ideas/[ideaId]/route.ts
- [X] T023 [US2] Add owner-only guard + conflict responses for non-draft mutations in app/api/ideas/[ideaId]/route.ts
- [X] T024 [US2] Add Delete Draft UI action with optimistic removal in app/components/submitter-dashboard.tsx
- [X] T025 [US2] Add draft privacy and admin exclusion notes to API contract in specs/004-draft-management/contracts/api.md

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Finalize Drafts Into Submitted Ideas (Priority: P2)

**Goal**: Submitter can submit a valid draft into normal review flow, and submitted ideas become read-only to submitters.

**Independent Test**: Submit valid draft, confirm it appears in admin queue, and verify submitter cannot edit it anymore.

### Tests for User Story 3

- [X] T026 [US3] Add US3 manual validation checklist steps for final submission and read-only behavior in specs/004-draft-management/quickstart.md

### Implementation for User Story 3

- [X] T027 [US3] Implement draft final-submit endpoint with strict validation in app/api/ideas/[ideaId]/submit/route.ts
- [X] T028 [US3] Apply draft-to-submitted state transition on same idea record in app/api/ideas/[ideaId]/submit/route.ts
- [X] T029 [US3] Preserve draft data on failed final-submit validation in app/api/ideas/[ideaId]/submit/route.ts
- [X] T030 [US3] Enforce submitter read-only behavior for non-draft ideas in app/components/idea-form.tsx
- [X] T031 [US3] Hide or disable edit/delete controls for submitted ideas in app/components/idea-card.tsx
- [X] T032 [US3] Ensure submitted-from-draft ideas appear in admin queue without regressions in app/api/admin/ideas/route.ts
- [X] T033 [US3] If submissionMode is absent, treat request as final submission in app/api/ideas/route.ts (backward compatibility)

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression confidence, docs synchronization, and release-ready validation.

- [X] T034 [P] Update draft management implementation notes and edge cases in specs/004-draft-management/plan.md (traceability: FR-012)
- [X] T035 [P] Run and record lint/build results for draft feature in specs/004-draft-management/quickstart.md (traceability: FR-012, SC-005)
- [ ] T036 Run full Phase 1-3 regression checklist with draft scenarios in specs/004-draft-management/quickstart.md (traceability: FR-012, SC-005)
- [X] T037 [P] Document final endpoint and state transition behavior updates in specs/004-draft-management/contracts/api.md (traceability: FR-007, FR-008, FR-011)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup completion and blocks all user stories.
- User Stories (Phase 3-5): Depend on Foundational completion.
- Polish (Phase 6): Depends on completion of targeted user stories.

### User Story Dependencies

- US1 (P1): Starts after Foundational; no dependency on other stories.
- US2 (P1): Starts after Foundational; can run in parallel with US1 but should integrate with US1 draft list shape.
- US3 (P2): Depends on US1 draft create/update behavior and US2 ownership/visibility guards.

### Suggested Completion Order

1. Phase 1
2. Phase 2
3. Phase 3 (US1 MVP)
4. Phase 4 (US2)
5. Phase 5 (US3)
6. Phase 6

---

## Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T007, T008, and T009 can run in parallel after T004-T006.
- After Foundational completion, US1 and US2 can start in parallel.
- T034, T035, and T037 can run in parallel in Polish phase.

---

## Parallel Example: User Story 1

```bash
Task: "T015 [US1] Add Save Draft and Resume Draft form behavior in app/components/idea-form.tsx"
Task: "T016 [US1] Wire draft edit action from dashboard list to form state in app/components/submitter-dashboard.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T020 [US2] Exclude draft status from admin queue response in app/api/admin/ideas/route.ts"
Task: "T023 [US2] Add Delete Draft UI action with optimistic removal in app/components/submitter-dashboard.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] Enforce submitter read-only behavior for non-draft ideas in app/components/idea-form.tsx"
Task: "T031 [US3] Ensure submitted-from-draft ideas appear in admin queue without regressions in app/api/admin/ideas/route.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 (US1).
4. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 for save/resume value.
2. Add US2 for privacy and management guarantees.
3. Add US3 for final lifecycle completion.
4. Finish with regression/polish tasks.

### Parallel Team Strategy

1. One developer completes Setup + Foundational tasks.
2. Then split by story:
- Developer A: US1 draft save/resume.
- Developer B: US2 privacy/delete/admin exclusion.
- Developer C: US3 submission transition/read-only behavior.
