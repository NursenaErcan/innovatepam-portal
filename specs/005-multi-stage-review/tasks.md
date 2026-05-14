# Tasks: Phase 5 Multi-Stage Review

**Input**: Design documents from `specs/005-multi-stage-review/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: No automated test suite requested in spec. Manual validation tasks (quickstart checklists) are included per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the Prisma schema with the new `ReviewStage` enum, `StageComment` model, and `reviewStage` field on `Idea`. Scaffold new route files so subsequent phases can implement in-place.

- [ ] T001 Add `ReviewStage` enum (`initial_screening`, `technical_review`, `business_impact_review`, `final_decision`) to `prisma/schema.prisma`
- [ ] T002 Add `StageComment` model (id, ideaId, adminId, stage, text, createdAt) with relations to `Idea` and `User` in `prisma/schema.prisma`
- [ ] T003 Add `reviewStage ReviewStage?` field to `Idea` model and `stageComments StageComment[]` relation in `prisma/schema.prisma`
- [ ] T004 [P] Create route file scaffold for `app/api/admin/[ideaId]/review-stage/route.ts`
- [ ] T005 [P] Create route file scaffold for `app/api/admin/[ideaId]/stage-comments/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Apply migration, regenerate client, build the stage-ordering utility, and enforce the US5 draft-exclusion invariant before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Run `npm run db:migrate -- --name multi-stage-review` and verify migration backfills `reviewStage = initial_screening` on all existing `submitted`/`under_review` ideas and leaves `draft` ideas as `null` in `prisma/migrations/`
- [ ] T007 Regenerate Prisma client with `npm run db:generate` and confirm TypeScript types include `ReviewStage` and `StageComment` in `node_modules/.prisma/client`
- [ ] T008 Create `lib/review-stages.ts` with: `REVIEW_STAGES` ordered array, `STAGE_LABELS` display-name map, `getNextStage(stage)` helper, `getPreviousStage(stage)` helper, and `isValidReviewStage(value)` type guard
- [ ] T009 [P] Update `POST /api/ideas/[ideaId]/submit` to atomically set `reviewStage: "initial_screening"` alongside `status: "submitted"` on successful draft submission in `app/api/ideas/[ideaId]/submit/route.ts`

**Checkpoint**: Schema migrated, Prisma client regenerated, stage helpers available, draft-submit auto-assigns `initial_screening`. User story implementation can now begin.

---

## Phase 3: User Story 1 - Admin Advances Idea Through Review Stages (Priority: P1) 🎯 MVP

**Goal**: Admins can move any non-final submitted idea forward and backward through the four review stages one step at a time.

**Independent Test**: Submit an idea → confirm it starts at Initial Screening in admin panel → advance through all four stages → confirm no further advance past Final Decision → retreat one step and confirm.

### Implementation for User Story 1

- [ ] T010 [US1] Implement `PATCH /api/admin/[ideaId]/review-stage` in `app/api/admin/[ideaId]/review-stage/route.ts`: validate `direction` body field, use `getNextStage`/`getPreviousStage` from `lib/review-stages.ts`, return `409` for accepted/rejected/draft ideas, return `400` for boundary violations
- [ ] T011 [P] [US1] Create `ReviewPipeline` component in `app/components/review-pipeline.tsx`: renders an ordered four-stage progress indicator, accepts `currentStage`, `isAdmin`, `onAdvance`, `onRetreat` props; disables advance/retreat on final-state or boundary ideas
- [ ] T012 [US1] Integrate `ReviewPipeline` with advance/retreat controls into the admin idea detail section in `app/components/admin-ideas-panel.tsx`
- [ ] T013 [US1] Extend `GET /api/admin/ideas` response to include both `reviewStage` and full `stageComments` history in each idea summary in `app/api/admin/ideas/route.ts`. Ensure the admin API returns all stage comments for each idea.

**Checkpoint**: Admin can advance and retreat ideas through all four review stages. Stage indicator renders correctly. Boundary and final-state blocking works.

---

## Phase 4: User Story 2 - Admin Adds Stage-Specific Evaluation Comments (Priority: P1)

**Goal**: Admins can record evaluation comments scoped to a specific review stage; all comments are retained and displayed in chronological order with their stage label.

**Independent Test**: Open any non-draft idea as admin → add a comment at current stage → advance stage → add another comment → confirm both comments are visible with correct stage labels and in creation order.

### Implementation for User Story 2

- [ ] T014 [US2] Implement `POST /api/admin/[ideaId]/stage-comments` in `app/api/admin/[ideaId]/stage-comments/route.ts`: validate non-empty `text` and valid `stage` enum value, reject draft ideas with `409`, persist `StageComment`, return created comment including `adminId`
- [ ] T015 [P] [US2] Create `StageCommentForm` component in `app/components/stage-comment-form.tsx`: textarea for comment text, stage selector pre-filled with current idea stage, accepts `onSubmit(text: string, stage: ReviewStage) => void` callback prop — no direct API calls inside the component; all data-fetching logic stays in the parent `app/components/admin-ideas-panel.tsx`
- [ ] T016 [P] [US2] Create `StageCommentList` component in `app/components/stage-comment-list.tsx`: accepts `comments: StageCommentEntry[]` and `showAdmin: boolean` props, renders comments ordered by `createdAt` ascending, displays stage label badge per comment
- [ ] T017 [US2] Integrate `StageCommentForm` and `StageCommentList` (with `showAdmin=true` and consuming the full `stageComments` history) into the admin idea detail section in `app/components/admin-ideas-panel.tsx`. Ensure all stage comments are loaded and displayed for each idea.

**Checkpoint**: Admin can add stage-scoped comments at any active review stage. All comments persist across stage changes and are displayed chronologically with stage labels.

---

## Phase 5: User Story 4 - Final Decision Sets Accepted or Rejected Status (Priority: P1)

**Goal**: From the Final Decision stage, admins can mark an idea as Accepted or Rejected, making it a permanent, immutable outcome that removes the idea from the active review queue.

**Independent Test**: Advance idea to Final Decision → click Accept → confirm status is Accepted → confirm no stage controls are visible → confirm idea is absent from active review queue. Repeat with Reject.

### Implementation for User Story 4

- [ ] T018 [US4] Add immutability guard in `app/api/admin/[ideaId]/review-stage/route.ts`: return `409` when idea `status` is `accepted` or `rejected` (covers FR-004, FR-012)
- [ ] T018b [US4] Enforce stage-gate in `app/api/admin/[ideaId]/status/route.ts`: when the requested status is `accepted` or `rejected`, verify `idea.reviewStage === "final_decision"` and return `409` with `{ error: "Idea must be at Final Decision stage before accepting or rejecting" }` if not (covers FR-007)
- [ ] T019 [US4] Add `Accept` and `Reject` action buttons in `app/components/admin-ideas-panel.tsx` that are visible only when `reviewStage === "final_decision"` and `status` is not yet final; wire to existing `PATCH /api/admin/[ideaId]/status` endpoint
- [ ] T020 [US4] Update admin idea list in `app/components/admin-ideas-panel.tsx` to consume the new structured API response `{ active: IdeaSummary[], resolved: IdeaSummary[] }` and move ideas with `status ∈ {accepted, rejected}` into a collapsible **Resolved Ideas** section below the active review queue. Do not hide them entirely. Ensure the UI consumes the `active` and `resolved` arrays as returned by the API.
- [ ] T021 [US4] Update `app/api/admin/ideas/route.ts` to return a structured response separating active pipeline ideas from resolved ones: `{ active: IdeaSummary[], resolved: IdeaSummary[] }`; active excludes `draft`, `accepted`, `rejected`; resolved contains `accepted` and `rejected` only

**Checkpoint**: Final decisions are irreversible. Accepted/Rejected ideas vanish from the active queue. No stage transitions possible post-decision.

---

## Phase 6: User Story 3 - Submitter Views Current Review Stage and Feedback (Priority: P2)

**Goal**: Submitters can see the current review stage and read all stage-scoped admin comments on their submitted ideas; draft ideas show no review stage information.

**Independent Test**: Submit an idea and add stage comments as admin → view the idea as the submitter → confirm current stage label is visible, all comments appear with stage labels, no admin identity is exposed → open a draft and confirm no stage info is shown.

### Implementation for User Story 3

- [X] T022 [US3] Extend `GET /api/ideas/[ideaId]` to include `reviewStage`, `reviewStageLabel`, and `stageComments` (array without `adminId`) when requester is the owner submitter in `app/api/ideas/[ideaId]/route.ts`
- [X] T023 [US3] Reuse `ReviewPipeline` in read-only mode (no `onAdvance`/`onRetreat`) for the submitter idea detail or dashboard card in `app/components/idea-card.tsx`
- [X] T024 [US3] Reuse `StageCommentList` with `showAdmin=false` to display stage feedback to submitters in `app/submitter/ideas/page.tsx` or submitter idea detail view
- [X] T025 [US3] Ensure `reviewStage` and `stageComments` are `null`/`[]` for draft ideas in the submitter-facing API response in `app/api/ideas/[ideaId]/route.ts`

**Checkpoint**: Submitters see current review stage and admin feedback on submitted ideas. Drafts show no review stage. Admin identity is not exposed.

---

## Phase 7: User Story 5 — Draft Exclusion Regression Verification *(Phase 4 behavior, not new code)*

> **Note**: US5 (draft pipeline exclusion) is enforced by Phase 4 foundations and the Phase 2 schema defaults. Phase 7 tasks are **regression verification only** — they confirm existing guards remain intact after Phase 5 changes. No new implementation is expected.

**Goal**: Confirm draft ideas cannot enter the review pipeline through any Phase 5 code path.

**Independent Test**: Save a draft → confirm absent from admin review queue → submit the draft → confirm it appears in Initial Screening.

### Regression Verification for User Story 5

- [ ] T026 [US5] *(verify)* Confirm migration sets `reviewStage = null` for all `draft` ideas; add explicit `WHERE status = 'draft'` backfill guard if missing in `prisma/migrations/[timestamp]_multi_stage_review/migration.sql`
- [ ] T027 [US5] *(verify)* Confirm `app/api/admin/[ideaId]/review-stage/route.ts` returns `409` for draft ideas — no code change needed if T010 already covers this guard
- [ ] T028 [US5] *(verify)* Confirm `app/api/admin/[ideaId]/stage-comments/route.ts` returns `409` for draft ideas — no code change needed if T014 already covers this guard
- [ ] T029 [US5] *(verify)* Confirm `app/api/admin/ideas/route.ts` `active` array excludes `draft` ideas (Phase 4 filter still applied after T021 restructure)

**Checkpoint**: All Phase 4 draft-exclusion guards confirmed intact after Phase 5 changes. No regressions introduced.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, regression validation, and success criteria verification across all user stories.

- [X] T030 [P] Run `npm run lint` and resolve any TypeScript strict-mode errors introduced by Phase 5 changes
- [X] T031 [P] Run `npm run build` and confirm zero build errors
- [ ] T032 Run the Phase 1–4 backward compatibility checklist from `specs/005-multi-stage-review/quickstart.md` to confirm zero regressions
- [ ] T033 [P] Verify SC-001 through SC-006 using the measurement reference table in `specs/005-multi-stage-review/quickstart.md`. Explicitly complete all keyboard/focus accessibility validation steps for ReviewPipeline, StageCommentForm, and StageCommentList as listed in quickstart.md (tab navigation, visible focus, keyboard-only submission, disabled controls focus/tooltip, screen-reader labels).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 completion; no dependency on US2/US4/US3/US5
- **US2 (Phase 4)**: Depends on Phase 2 completion; no dependency on US1 (can run in parallel with US1 after Phase 2)
- **US4 (Phase 5)**: Depends on Phase 3 (US1) **and Phase 4 (US2)** completion — Final Decision requires stage transition infrastructure (US1) and `admin-ideas-panel.tsx` must have stage comment integration (US2) before US4 UI tasks (T019, T020) can land cleanly
- **US3 (Phase 6)**: Depends on Phase 3 (US1) and Phase 4 (US2) completion — submitter view reads stage + comments
- **US5 (Phase 7)**: Regression verification only — depends on Phase 2 completion; run after Phase 5 (US4) to confirm no Phase 5 code paths introduced regressions in draft exclusion
- **Polish (Phase 8)**: Depends on all user story phases being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓              ↓
Phase 3 (US1)   Phase 4 (US2)
    ↓              ↓
Phase 5 (US4) ←──────●
    ↓
Phase 6 (US3)
    ↓
Phase 7 (US5) [regression verification — no new code]
    ↓
Phase 8 (Polish)
```

### Parallel Opportunities

**Within Phase 1**: T004 and T005 can run in parallel (separate new files).

**Within Phase 2**: T009 can run in parallel with T006/T007/T008 (different file from migration path).

**Within Phase 3 (US1)**: T011 (`ReviewPipeline` component) can be developed in parallel with T010 (route handler) since they touch different files.

**Within Phase 4 (US2)**: T015 (`StageCommentForm`) and T016 (`StageCommentList`) can be built in parallel with T014 (route handler).

**After Phase 2**: Phase 3 (US1) and Phase 4 (US2) can be worked on in parallel by different team members.

**Within Phase 8**: T030, T031, and T033 can run in parallel.

---

## Parallel Execution Example: Phase 3 (US1) + Phase 4 (US2)

After Phase 2 completes, two developers can work simultaneously:

**Developer A — US1 Stage Transitions**:
```
T010 → T011 (parallel) → T012 → T013
```

**Developer B — US2 Stage Comments**:
```
T014 → T015 (parallel with T016) → T016 → T017
```

Both streams converge at Phase 5 (US4) which depends on the admin panel UI from both streams.

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) — delivers the core stage-transition pipeline visible in the admin panel. Admins can advance and retreat ideas through all four stages.

**Full P1 delivery**: Add Phase 4 (US2) for stage comments and Phase 5 (US4) for final Accept/Reject decisions. All P1 stories complete.

**Full delivery**: Add Phase 6 (US3) for submitter visibility and Phase 7 (US5) for draft exclusion verification. All P2 stories complete.
