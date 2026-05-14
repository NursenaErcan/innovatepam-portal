# Tasks: Blind Review

**Input**: Design documents from `/specs/006-blind-review/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Includes regression tests for Phase 5 workflows and new blind review behavior validation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization—none required; Phase 6 uses existing dev environment and dependencies

✅ No setup tasks needed. All required tools and dependencies (React, Next.js, Tailwind, Prisma) are already present from Phase 1–5.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core rendering infrastructure—none required; blind review is a pure presentation feature with no schema or API changes

✅ No foundational blocking tasks. Blind review does not require new database migrations, authentication changes, or API framework extensions. All implementation uses existing patterns from Phase 5.

**Checkpoint**: Ready to begin user story implementation

---

## Phase 3: User Story 1 - Admin reviews idea without seeing submitter identity (Priority: P1) 🎯 MVP

**Goal**: Hide submitter name and email in admin review panel when idea is at Initial Screening, Technical Review, or Business Impact Review stages

**Independent Test Criteria**: 
- Admin opens an idea at Technical Review; no submitter identity is visible in the card
- Admin advances to Final Decision; submitter identity becomes visible
- All other idea content (title, description, attachments, stage comments) remains visible

**Implementation Tasks**:

- [X] T001 [P] Create blind stage detection helper in lib/review-stages.ts with BLIND_STAGES constant
- [X] T002 [P] Modify app/components/admin-ideas-panel.tsx to compute showSubmitter prop based on reviewStage
- [X] T003 [P] Modify app/components/idea-card.tsx to conditionally render submitter identity section with showSubmitter prop
- [X] T004 [P] Modify app/api/admin/ideas/route.ts to filter submitter from JSON response for blind-stage ideas
- [ ] T005 [US1] Add test case: Verify admin opening blind-stage idea shows no submitter identity
- [ ] T006 [US1] Add test case: Verify admin opening Final Decision idea shows full submitter identity
- [ ] T007 [US1] Add test case: Verify title, description, custom fields, attachments render normally even when submitter is hidden

---

## Phase 4: User Story 2 - Submitter always sees their own ideas normally (Priority: P1)

**Goal**: Ensure submitter dashboard and submitter-facing endpoints are unaffected by blind review logic

**Independent Test Criteria**:
- Submitter views their ideas on submitter dashboard; all fields including submitter identity are displayed
- Submitter-facing API responses include submitter identity unconditionally
- Phase 5 behavior is completely preserved for submitter UX

**Regression Tests**:

- [ ] T008 [US2] Verify submitter dashboard at app/submitter/ideas/page.tsx is unchanged (no showSubmitter logic applied)
- [ ] T009 [US2] Verify GET /api/ideas/{ideaId} for submitter always includes submitter identity (not filtered by blind stage)
- [ ] T010 [US2] Verify stage comments are visible to submitters with original showAdmin=false behavior
- [ ] T011 [US2] Verify submitter can view their own idea at any review stage with full identity visible

---

## Phase 5: User Story 3 - StageComment workflow continues unchanged under blind review (Priority: P1)

**Goal**: Admin stage comments remain fully functional; comment authoring and history unaffected by blind review

**Independent Test Criteria**:
- Admin adds stage comment to blind-stage idea; comment is saved and displayed correctly
- Stage comment list renders normally with showAdmin=true for admins and showAdmin=false for submitters
- Comment text, stage label, and timestamp all visible regardless of blind review state

**Regression Tests**:

- [ ] T012 [US3] Verify stage comment creation at Technical Review (blind stage) succeeds and persists
- [ ] T013 [US3] Verify stage comment list displays correctly for blind-stage ideas
- [ ] T014 [US3] Verify showAdmin=true renders comment author identity (admin context)
- [ ] T015 [US3] Verify showAdmin=false hides comment author identity (submitter view)
- [ ] T016 [US3] Verify stage label (initial_screening, technical_review, etc.) always visible in comment metadata

---

## Phase 6: User Story 4 - Stage transitions continue working under blind review (Priority: P2)

**Goal**: Advance/retreat controls remain functional; identity visibility toggles correctly during stage transitions

**Independent Test Criteria**:
- Advancing from Technical Review (blind) to Business Impact Review (blind) keeps identity hidden
- Advancing to Final Decision (non-blind) exposes submitter identity
- Retreating from Final Decision back to blind stage hides identity again

**Regression Tests**:

- [ ] T017 [P] [US4] Verify advancing idea from Technical Review → Business Impact Review succeeds (ReviewPipeline unchanged)
- [ ] T018 [P] [US4] Verify advancing from Business Impact Review → Final Decision exposes submitter identity
- [ ] T019 [P] [US4] Verify retreating from Final Decision → Business Impact Review hides submitter identity again
- [ ] T020 [US4] Verify previous/next stage controls render correctly at all stages
- [ ] T021 [US4] Verify stage transition API calls (if any) remain unchanged and working

---

## Phase 7: User Story 5 - Accepted/Rejected outcomes are unchanged (Priority: P2)

**Goal**: Final Decision accept/reject workflow unaffected; submitter identity visible throughout decision process

**Independent Test Criteria**:
- Accept button at Final Decision works; status changes to Accepted
- Reject button at Final Decision works; status changes to Rejected
- Submitter identity is visible when viewing accepted/rejected ideas
- Resolved ideas (Accepted/Rejected) exclude blind review filtering

**Regression Tests**:

- [ ] T022 [P] [US5] Verify accept action at Final Decision changes status to Accepted
- [ ] T023 [P] [US5] Verify reject action at Final Decision changes status to Rejected
- [ ] T024 [US5] Verify submitter identity is visible on Accepted status ideas
- [ ] T025 [US5] Verify submitter identity is visible on Rejected status ideas
- [ ] T026 [US5] Verify accept/reject buttons are disabled/unavailable at non-Final-Decision stages
- [ ] T027 [US5] Verify Phase 5 accept/reject workflow completes end-to-end without regression

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and production readiness

- [X] T028 Remove temporary Phase 5 debug artifacts from app/components/submitter-dashboard.tsx (PHASE 5 DEBUG banner)
- [X] T029 Remove temporary Phase 5 debug artifacts from app/components/idea-card.tsx (Debug comments count text)
- [X] T030 Remove temporary Phase 5 console.log from app/submitter/ideas/page.tsx (SUBMITTER STAGE COMMENTS DEBUG)
- [X] T031 Run lint check: npm run lint -- verify no TypeScript errors or unused variables
- [X] T032 Run build: npm run build -- confirm production build succeeds
- [ ] T033 Run full manual test on submitter dashboard (mobile and desktop viewports)
- [ ] T034 Run full manual test on admin panel (mobile and desktop viewports)
- [ ] T035 Verify accessibility: keyboard navigation, visible focus, contrast ratios on all modified screens

---

## Dependency Graph & Implementation Strategy

### User Story Completion Order (MVP First)

**MVP Scope: US1 + Regression Tests (US2–US5)**

1. **US1 (P1)**: Core blind review feature — implement first, unblocked
2. **US2 (P1)**: Regression suite — validate submitter UX unaffected, runs in parallel with US1 implementation
3. **US3 (P1)**: StageComment regression — runs in parallel with US1
4. **US4 (P2)**: Stage transition regression — runs in parallel with US1 (Phase 5 already works)
5. **US5 (P2)**: Accept/reject regression — runs in parallel with US1 (Phase 5 already works)
6. **Phase 8**: Cleanup and production validation

### Task Parallelization

**Can run in parallel** (independent files, no dependencies):

- **T001**: Helper function (no dependencies on other tasks)
- **T002**: AdminIdeasPanel (depends on T001)
- **T003**: IdeaCard (depends on T001)
- **T004**: Admin API route (depends on T001)
- **T008–T027**: All regression tests (read-only, no dependencies)

**Sequential dependencies**:

- T002 must complete before T005–T007 (component tests for AdminIdeasPanel)
- T003 must complete before T005–T007 (component tests for IdeaCard)
- T004 must complete before API-level validation
- All implementation tasks (T001–T004) must complete before Phase 8 cleanup

### Suggested Development Order

**Day 1 (Foundation)**:
- [ ] T001: Create BLIND_STAGES constant and helper

**Day 1–2 (Parallel Implementation)**:
- [ ] T002: AdminIdeasPanel modification (2–3 lines of code)
- [ ] T003: IdeaCard modification (4–5 lines of code)
- [ ] T004: Admin API filtering (3–5 lines of code)

**Day 2 (Testing)**:
- [ ] T005–T027: Test implementation and regression validation (manual browser testing)

**Day 3 (Polish)**:
- [ ] T028–T035: Cleanup and production readiness

---

## Files Modified

| File | Tasks | Scope |
|------|-------|-------|
| `lib/review-stages.ts` | T001 | Add BLIND_STAGES constant |
| `app/components/admin-ideas-panel.tsx` | T002 | Compute showSubmitter from reviewStage |
| `app/components/idea-card.tsx` | T003 | Conditional submitter rendering |
| `app/api/admin/ideas/route.ts` | T004 | Filter submitter in JSON response |
| `app/components/submitter-dashboard.tsx` | T028 | Remove debug banner |
| `app/components/idea-card.tsx` | T029 | Remove debug text (if present) |
| `app/submitter/ideas/page.tsx` | T030 | Remove debug console.log |

**No new files created. No schema migrations required.**

---

## Estimated Effort

- **Coding**: ~2–3 hours (4 simple modifications, ~15 lines total)
- **Testing**: ~3–4 hours (browser-based regression testing + acceptance criteria validation)
- **Total**: ~5–7 hours (typical for a rendering-layer feature with no schema changes)

---

## Success Criteria (from spec.md)

✅ **SC-001**: For 100% of ideas at blind stages, no submitter identity appears in admin panel (T005–T007)  
✅ **SC-002**: For 100% of ideas at Final Decision/Accepted/Rejected, submitter identity visible (T006, T024–T025)  
✅ **SC-003**: Stage comment creation/display success rate 100% (T012–T016)  
✅ **SC-004**: Stage transition success rate 100% (T017–T021)  
✅ **SC-005**: Zero regressions in Phase 1–5 submitter flows (T008–T011)  
✅ **SC-006**: Identity toggle instantaneous, no extra API round-trip (component render time ~0ms)
