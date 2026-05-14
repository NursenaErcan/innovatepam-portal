# Tasks: Smart Submission Forms

**Input**: Design documents from `/specs/002-smart-submission-forms/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit automated test mandate in the feature spec; use manual validation tasks from quickstart and regression checkpoints.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare schema, baseline mappings, and documentation scaffolding for dynamic fields.

- [X] T001 Update `prisma/schema.prisma` to add Idea `customFields` storage for category-specific values.
- [X] T002 Create and apply Prisma migration for dynamic fields with `npm run db:migrate -- --name smart-submission-forms` and commit files under `prisma/migrations/`.
- [X] T003 [P] Create `lib/category-fields.ts` with category-to-field definitions and labels for Technical Innovation, Process Improvement, and Client Solution.
- [X] T004 [P] Update `specs/002-smart-submission-forms/contracts/api.md` and `specs/002-smart-submission-forms/quickstart.md` if implementation decisions require contract wording adjustments.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared parsing, validation, and API support needed by all user stories.

**⚠️ CRITICAL**: No user story work should be considered complete until this phase is finished.

- [X] T005 Update `lib/validation.ts` to validate category-specific `customFields` payloads by selected category.
- [X] T006 Add `implementationComplexity` enum validation (`low|medium|high`) in `lib/validation.ts` for Technical Innovation.
- [X] T007 Add positive-integer validation for `estimatedTimeSavingsHours` in `lib/validation.ts` for Process Improvement.
- [X] T008 Update `app/api/ideas/route.ts` to parse `customFields` from form data and enforce category-specific server-side validation.
- [X] T009 Update error responses in `app/api/ideas/route.ts` to include field-level dynamic validation feedback for invalid submissions.
- [X] T010 [P] Update `app/api/ideas/route.ts` and `app/api/admin/ideas/route.ts` response shaping to include `customFields` additively while preserving existing fields.
- [X] T011 [P] Create `app/components/custom-fields-view.tsx` to render category-aware labels for dynamic field values.

**Checkpoint**: Foundation ready; dynamic-field stories can now be completed independently.

---

## Phase 3: User Story 1 - Category-Driven Form Inputs (Priority: P1) 🎯 MVP

**Goal**: Submitters see category-specific fields immediately when category changes.

**Independent Test**: Sign in as submitter, switch categories, and verify each category shows the correct dynamic fields.

### Implementation for User Story 1

- [X] T012 [US1] Update `app/components/idea-form.tsx` to render dynamic field groups from `lib/category-fields.ts` based on selected category.
- [X] T013 [US1] Add controlled form state in `app/components/idea-form.tsx` for Technical Innovation fields: architecture impact, technology stack, implementation complexity.
- [X] T014 [US1] Add controlled form state in `app/components/idea-form.tsx` for Process Improvement fields: current process, proposed improvement, estimated time savings.
- [X] T015 [US1] Add controlled form state in `app/components/idea-form.tsx` for Client Solution fields: client problem, business impact, target industry.
- [X] T016 [US1] Implement category-change behavior in `app/components/idea-form.tsx` to switch active field set and prevent stale fields from acting as required inputs.
- [X] T017 [US1] Update submit handling in `app/components/idea-form.tsx` to serialize and send `customFields` with existing core submission payload.

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Dynamic Field Validation and Submission Integrity (Priority: P1)

**Goal**: Dynamic fields are validated correctly with clear feedback; valid submissions succeed.

**Independent Test**: Submit missing/invalid category-specific values and verify errors, then submit valid values and verify success.

### Implementation for User Story 2

- [X] T018 [US2] Implement client-side required validation messages for category-specific fields in `app/components/idea-form.tsx`.
- [X] T019 [US2] Implement field-level display of server-returned dynamic validation errors in `app/components/idea-form.tsx`.
- [X] T020 [US2] Enforce Process Improvement numeric constraints in `app/components/idea-form.tsx` input handling (positive integer hours only).
- [X] T021 [US2] Enforce Technical Innovation complexity selection in `app/components/idea-form.tsx` using enum options `low`, `medium`, `high`.
- [X] T022 [US2] Update `app/api/ideas/route.ts` to block submission when selected-category dynamic fields are invalid and keep existing attachment validation behavior intact.
- [X] T023 [US2] Verify and preserve successful submission path in `app/api/ideas/route.ts` for categories without custom fields (e.g., `Other`).

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Backward-Compatible Phase 1 Workflow (Priority: P2)

**Goal**: Phase 1 functionality remains working and admin sees labeled dynamic fields.

**Independent Test**: Run full Phase 1 submitter/admin flow plus admin review of dynamic fields without regressions.

### Implementation for User Story 3

- [X] T024 [US3] Update `app/components/admin-ideas-panel.tsx` to render `customFields` using `app/components/custom-fields-view.tsx` with category-aware labels.
- [X] T025 [US3] Update `app/components/idea-card.tsx` (or admin display layer) to include dynamic field section in admin context without breaking submitter display.
- [X] T026 [US3] Ensure `app/submitter/ideas/page.tsx` and `app/admin/ideas/page.tsx` continue loading ideas safely when `customFields` is null for older records.
- [X] T027 [US3] Validate route/access behavior remains unchanged in `lib/auth.ts` and all affected pages/routes after dynamic field changes.
- [X] T028 [US3] Update manual regression checklist in `specs/002-smart-submission-forms/quickstart.md` with explicit Phase 1 compatibility checks.

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across stories and docs.

- [X] T029 [P] Improve accessibility labels and error associations for dynamic fields in `app/components/idea-form.tsx`.
- [X] T030 [P] Refine dynamic-field label copy consistency in `lib/category-fields.ts` and `app/components/custom-fields-view.tsx`.
- [X] T031 [P] Update `specs/002-smart-submission-forms/data-model.md` and `specs/002-smart-submission-forms/contracts/api.md` to match any final implementation naming.
- [X] T032 Run final local validation commands (`npm run lint`, `npm run build`, `npm run db:generate`) and record outcomes in `specs/002-smart-submission-forms/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks story completion.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on completion of all target user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational phase.
- **User Story 2 (P1)**: Depends only on Foundational phase; may proceed in parallel with US1.
- **User Story 3 (P2)**: Depends on Foundational phase and should be executed after US1/US2 core behavior is stable.

### Within Each User Story

- Define/prepare field mapping and state before UI integration.
- Validate and parse inputs before persisting.
- Complete core behavior before regression/documentation updates.

### Parallel Opportunities

- Phase 1: `T003`, `T004` can run in parallel.
- Phase 2: `T010`, `T011` can run in parallel after validation core tasks begin.
- US1: `T013`, `T014`, `T015` can run in parallel once dynamic framework exists.
- Polish: `T029`, `T030`, `T031` can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel dynamic field group implementation:
Task: "T013 [US1] Technical Innovation field state"
Task: "T014 [US1] Process Improvement field state"
Task: "T015 [US1] Client Solution field state"
```

---

## Implementation Strategy

### MVP First (P1 focus)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 (dynamic field rendering).
3. Complete User Story 2 (dynamic validation integrity).
4. Validate submitter flow independently.

### Incremental Delivery

1. Deliver dynamic form switching (US1).
2. Deliver strict dynamic validation (US2).
3. Deliver backward-compatible admin + regression confidence (US3).
4. Execute polish and full validation.

### Team Parallelization

1. One developer: foundational validation and API (`T005`-`T010`).
2. One developer: submitter form dynamics (`T012`-`T021`).
3. One developer: admin rendering and regression checks (`T024`-`T032`) after foundational readiness.

---

## Notes

- `[P]` tasks indicate no direct file conflict and independent sequencing.
- Story labels map each task to an independently testable slice.
- Keep all API/data changes additive to preserve Phase 1 compatibility.
