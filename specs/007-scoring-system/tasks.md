---
description: "Task list for Phase 7 Scoring System implementation"
---

# Tasks: Phase 7 Scoring System

**Input**: Design documents from `/specs/007-scoring-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Feature**: Multi-dimensional scoring system for admin review pipeline with submitter visibility after Final Decision

**Tech Stack**: Next.js 16.2.6, React, Prisma ORM, TypeScript, Tailwind CSS

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- Exact file paths included for all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend database schema, create utilities, establish type definitions

**⚠️ CRITICAL**: This phase must be complete before Phase 2 begins

### Database Schema Extension

- [ ] T001 Extend Prisma schema with ScoringDimension enum and IdeaScore model in `prisma/schema.prisma`
  - Add `enum ScoringDimension { INNOVATION, FEASIBILITY, BUSINESS_IMPACT }`
  - Add IdeaScore model with fields: id, ideaId, dimension, value (1-5), reviewedBy, createdAt, updatedAt
  - Add relations: Idea.scores, User.scoresByReviewer
  - Add unique constraint: (ideaId, dimension, reviewedBy)
  - Add indexes on ideaId, (ideaId, dimension), reviewedBy

- [ ] T002 Create Prisma migration for IdeaScore table
  - Run `npx prisma migrate dev --name add_scoring`
  - Verify migration file created in `prisma/migrations/[timestamp]_add_scoring/migration.sql`
  - Test migration with `npx prisma db push`

### Utility Functions

- [ ] T003 [P] Create scoring validation utility in `lib/scoring-validation.ts`
  - `validateScore(value: unknown): { valid: boolean; error?: string }`
  - `validateDimension(dimension: unknown): boolean`
  - Export ScoringDimension enum types for TypeScript
  - Validation: value must be integer 1-5, dimension must be INNOVATION|FEASIBILITY|BUSINESS_IMPACT

- [ ] T004 [P] Create score aggregation utility in `lib/scoring-aggregation.ts`
  - `aggregateScores(scores: IdeaScore[]): AggregateScore`
  - Returns object with innovation, feasibility, businessImpact (average or null)
  - `canViewScoreSummary(ideaStatus: string): boolean` - returns true if status is "accepted" or "rejected"
  - `filterScoresForDisplay(scores: IdeaScore[], dimension: ScoringDimension): IdeaScore[]`

- [ ] T005 [P] Create score query utilities in `lib/score-queries.ts`
  - `getScoresForIdea(ideaId: number)` - Prisma query helper
  - `getScoresByDimension(ideaId: number, dimension: ScoringDimension)` - Prisma query helper
  - `hasReviewerScored(ideaId: number, dimension: ScoringDimension, reviewerId: string)` - boolean check

### TypeScript Types

- [ ] T006 [P] Create scoring types in `lib/scoring-types.ts`
  - Export `type IdeaScore` with all fields from Prisma model
  - Export `type AggregateScore { innovation: number | null; feasibility: number | null; businessImpact: number | null }`
  - Export `type ScoringDimension = "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT"`
  - Export `interface ScoreInputProps` for React component
  - Export `interface ScoreSummaryProps` for React component

**Checkpoint**: Database schema extended, utilities created, types defined. Phase 2 can now begin.

---

## Phase 2: Foundational (API Routes & Components)

**Purpose**: Implement API endpoints and React components used by all user stories

**⚠️ CRITICAL**: This phase must be complete before user story implementation begins

### API Routes

- [ ] T007 Create POST /api/admin/[ideaId]/score route in `app/api/admin/[ideaId]/score/route.ts`
  - Extract request body: { dimension, value }
  - Validate dimension and value (1-5 range)
  - Verify idea exists (404 if not)
  - Verify idea is not draft (409 if draft)
  - Verify user is authenticated admin (403 if not)
  - Upsert score using Prisma (composite key: ideaId, dimension, reviewedBy)
  - Return success response with score object (200)
  - Return appropriate error responses (400, 404, 409, 403)

- [ ] T008 Create GET /api/admin/[ideaId]/score route in `app/api/admin/[ideaId]/score/route.ts` (extend existing POST)
  - Verify user is authenticated admin (403 if not)
  - Verify idea exists (404 if not)
  - Query all scores for idea using Prisma
  - Include reviewer user info (id, email)
  - Return scores array with metadata
  - Return 200 success response

- [ ] T009 Create GET /api/ideas/[ideaId]/score-summary route in `app/api/ideas/[ideaId]/score-summary/route.ts`
  - Verify user is authenticated submitter (403 if not)
  - Verify idea belongs to authenticated user (403 if not)
  - Verify idea status is "accepted" or "rejected" (403 if not)
  - Query all scores for idea
  - Aggregate using utility function (average per dimension)
  - Return aggregated scores or null for missing dimensions (200)
  - Return appropriate error responses (403, 404)

### React Components

- [ ] T010 [P] Create ScoreInput component in `components/score-input.tsx`
  - Props: ideaId, dimension, currentValue?, onSave?, disabled?
  - Render labeled number input (1-5 range)
  - Display dimension label (Innovation, Feasibility, Business Impact)
  - Show Save button (disabled if value empty or invalid)
  - Show loading state during save
  - Show error message on validation or API failure
  - Call POST /api/admin/[ideaId]/score on save
  - Call optional onSave callback after success
  - Validate input using scoring validation utility
  - Use Tailwind CSS for styling (consistent with existing components)

- [ ] T011 [P] Create ScoreSummary component in `components/score-summary.tsx`
  - Props: scores (innovation, feasibility, businessImpact)
  - Render three-column layout for dimensions
  - Display rounded average score for each dimension (or "—" if null)
  - Mobile-responsive (stacks on small viewports, grid on desktop)
  - Add visual styling: card background, metric labels, score display
  - Use Tailwind CSS for styling
  - No interactivity (read-only display)

- [ ] T012 [P] Create useScoreUpdate custom hook in `lib/hooks/useScoreUpdate.ts`
  - `useScoreUpdate(ideaId: number)` - returns { saveScore, loading, error }
  - `saveScore(dimension: ScoringDimension, value: number): Promise<IdeaScore>`
  - Call POST /api/admin/[ideaId]/score
  - Manage loading and error states
  - Validate score before sending
  - Handle API responses (200, 400, 403, 404, 409)
  - Return updated score object or throw error

### Integration Check

- [ ] T013 Test API routes and components in isolation
  - Verify POST /api/admin/[ideaId]/score creates/updates scores
  - Verify GET /api/admin/[ideaId]/score retrieves all scores
  - Verify GET /api/ideas/[ideaId]/score-summary returns aggregated scores (post-decision only)
  - Verify ScoreInput renders and calls onSave
  - Verify ScoreSummary renders aggregated scores correctly
  - Verify error handling in all routes

**Checkpoint**: All API routes functional, React components tested, hooks working. User story implementation can now begin.

---

## Phase 3: User Story 1 - Admin Scores Idea at Technical Review Stage (Priority: P1) 🎯 MVP

**Goal**: Enable admins to input 1-5 ratings for Innovation, Feasibility, and Business Impact at Technical Review stage. Scores persist immediately.

**Independent Test**: Admin navigates to an idea in Technical Review stage, enters scores for all three dimensions (1-5), saves, and verifies scores appear in the same session and database.

**Acceptance Criteria**:
1. Three input fields appear for Innovation, Feasibility, Business Impact (each 1-5)
2. Scores persist to database immediately on save
3. Validation errors display for out-of-range values
4. Score fields are editable without page reload

### Implementation for User Story 1

- [X] T014 Integrate ScoreInput components into admin review panel in `components/review-pipeline.tsx`
  - Add three ScoreInput instances for Innovation, Feasibility, Business Impact
  - Position below existing stage comment form
  - Pass ideaId, dimension, currentValue props
  - Set onSave callback to refresh scores after save
  - Display loading spinner during score save
  - Show error toast on save failure
  - Use useScoreUpdate hook for score management
  - Conditionally disable inputs if idea is draft (defensive check)

- [ ] T015 [P] Update admin-ideas-panel component to display score counts in `components/admin-ideas-panel.tsx`
  - Optional: Show score icon/badge if idea has scores
  - Show count of scored dimensions per idea
  - Use styling consistent with existing components
  - Non-blocking for US1 core functionality

- [ ] T016 Test User Story 1: Admin Scoring at Technical Review Stage
  - Manually test: Navigate to Technical Review stage idea, add scores
  - Verify all three scores save to database
  - Verify scores persist after page reload
  - Verify validation works (try value 0, 6, non-numeric)
  - Verify multiple reviewers can score same idea (different reviewerId stored)
  - Check database directly: `SELECT * FROM IdeaScore WHERE ideaId = ?`

**Checkpoint**: US1 complete. Admins can score ideas at Technical Review stage. Scores persist.

---

## Phase 4: User Story 2 - Admin Updates Scores Before Final Decision (Priority: P1)

**Goal**: Admins can edit existing scores at any review stage before Final Decision is made. Updated scores persist.

**Independent Test**: Admin creates initial scores at Technical Review, navigates back to same idea, updates one score, saves, and verifies new value in database.

**Acceptance Criteria**:
1. Score fields pre-populate with existing values
2. Editing and saving works without page reload
3. Updated scores reflect in database immediately
4. Scores remain editable through Business Impact Review stage
5. No errors when updating same dimension multiple times

### Implementation for User Story 2

- [X] T017 Fetch and pre-populate existing scores in review panel in `components/review-pipeline.tsx`
  - Call GET /api/admin/[ideaId]/score on component mount
  - Populate ScoreInput currentValue props with existing scores
  - Handle loading and error states for fetch
  - Refetch scores after each save (or use onSave callback)
  - Use useEffect to manage score loading lifecycle
  - Display loading skeleton while scores fetch

- [ ] T018 [P] Create useScoreFetch custom hook in `lib/hooks/useScoreFetch.ts`
  - `useScoreFetch(ideaId: number)` - returns { scores, loading, error, refetch }
  - Call GET /api/admin/[ideaId]/score
  - Parse response and organize by dimension
  - Provide refetch function to update scores after save
  - Handle loading and error states

- [ ] T019 Test User Story 2: Admin Score Updates
  - Create initial scores at Technical Review stage
  - Navigate to Business Impact Review stage
  - Verify existing scores are pre-populated
  - Update one score (e.g., Innovation 4 → 5)
  - Verify update persists to database
  - Verify multiple updates to same score work correctly
  - Check database: scores should have updated createdAt or updatedAt timestamp
  - Verify update works when multiple reviewers have scored same dimension

**Checkpoint**: US2 complete. Admins can edit scores before Final Decision. Scores update correctly.

---

## Phase 5: User Story 3 - Submitter Views Final Score Summary After Decision (Priority: P1)

**Goal**: After Final Decision (accepted/rejected status), submitters see aggregated score summary on their dashboard. Summary shows average scores per dimension.

**Independent Test**: Final Decision sets idea status to "accepted", submitter logs in, navigates to submitter dashboard, opens idea, and sees score summary with averaged Innovation/Feasibility/Business Impact scores.

**Acceptance Criteria**:
1. Score summary section appears only for accepted/rejected ideas
2. Summary shows aggregated (average) scores for each dimension
3. Summary displays "—" if no scores available for a dimension
4. Layout is responsive (mobile and desktop)
5. Submitter can only see scores for their own ideas

### Implementation for User Story 3

- [X] T020 Integrate ScoreSummary into submitter dashboard in `components/submitter-dashboard.tsx`
  - For each idea with status "accepted" or "rejected":
    - Fetch scores using GET /api/ideas/[ideaId]/score-summary
    - Render ScoreSummary component with aggregated scores
    - Handle loading state (skeleton or placeholder)
    - Handle error state (fallback message)
  - Position score summary in idea detail view (after decision details)
  - Hide score summary for ideas with other statuses
  - Use conditional rendering based on idea.status

- [ ] T021 Create useScoreSummary custom hook in `lib/hooks/useScoreSummary.ts`
  - `useScoreSummary(ideaId: number, ideaStatus: string)` - returns { scores, loading, error }
  - Only fetch if status is "accepted" or "rejected"
  - Return null scores if status doesn't allow visibility
  - Call GET /api/ideas/[ideaId]/score-summary
  - Parse aggregated scores response
  - Handle 403 (not decided) and 404 (not found) errors gracefully

- [ ] T022 Test User Story 3: Submitter Score Summary Visibility
  - Create and score an idea at review stages
  - Reject the idea in Final Decision
  - Log in as submitter
  - Verify score summary appears in submitter dashboard
  - Verify correct average values displayed per dimension
  - Test with multiple reviewers scoring same idea (verify aggregation)
  - Test with missing scores (verify "—" displays for empty dimensions)
  - Verify submitter cannot see scores for other users' ideas
  - Test idea in "submitted" status - scores should NOT be visible
  - Accept an idea and verify submitter sees score summary

**Checkpoint**: US3 complete. Submitters see score summary only after Final Decision.

---

## Phase 6: User Story 4 - Admin Cannot Score Draft Ideas (Priority: P2)

**Goal**: Draft ideas cannot be scored by admins. Validation prevents score creation/update on drafts.

**Independent Test**: Attempt to POST /api/admin/[draftIdeaId]/score, verify 409 error returned.

**Acceptance Criteria**:
1. POST /api/admin/[ideaId]/score returns 409 if idea status is "draft"
2. GET /api/admin/[ideaId]/score returns 404 or empty for drafts (defensive)
3. UI prevents score input on draft ideas (defensive check)
4. Error message explains why scoring is not allowed

### Implementation for User Story 4

- [ ] T023 Add draft status check in POST /api/admin/[ideaId]/score route in `app/api/admin/[ideaId]/score/route.ts`
  - After fetching idea, check `idea.status === "draft"`
  - Return 409 Conflict error with message: "Cannot score draft ideas"
  - Prevent score upsert for drafts
  - Log attempted scoring of draft for audit

- [ ] T024 [P] Add defensive UI check in ScoreInput component in `components/score-input.tsx`
  - Accept optional isDraft prop
  - Disable all inputs and show message if isDraft === true
  - Show helpful message: "Scores cannot be added to draft ideas"
  - Prevent onSave call if idea is draft

- [ ] T025 Add draft check to review panel in `components/review-pipeline.tsx`
  - Query idea.status before rendering score inputs
  - Conditionally render ScoreInput with isDraft prop
  - Show message if idea is draft: "This draft is not available for scoring"
  - This prevents UI confusion (drafts should not appear in admin review queue)

- [ ] T026 Test User Story 4: Draft Scoring Prevention
  - Create a draft idea
  - Attempt to score draft via API: POST /api/admin/[draftId]/score
  - Verify 409 error returned
  - Verify score is NOT created in database
  - Verify error message is user-friendly
  - Test that non-draft ideas can still be scored (positive test)

**Checkpoint**: US4 complete. Drafts cannot be scored. Validation enforced at API and UI layers.

---

## Phase 7: User Story 5 - Accepted/Rejected Ideas Retain Scores (Priority: P2)

**Goal**: Scores persist permanently after Final Decision is made. Status change to accepted/rejected does not modify or delete scores.

**Independent Test**: Score an idea, make Final Decision (accept/reject), query database, verify scores unchanged.

**Acceptance Criteria**:
1. Scores remain in database after Final Decision
2. Scores are not deleted or modified when status changes
3. Submitter can view (unchanged) scores after decision
4. Audit trail shows original score creation timestamps

### Implementation for User Story 5

- [ ] T027 Verify Prisma cascade behavior in `prisma/schema.prisma`
  - IdeaScore.idea relation has `onDelete: Cascade` (orphaned scores deleted if idea deleted, but OK)
  - IdeaScore.reviewer relation has `onDelete: Restrict` (prevent deleting users with scores, OK)
  - No direct update to scores on idea status change - scores persist independently
  - Review migration to ensure no truncation or deletion logic

- [ ] T028 Verify Final Decision flow does not modify scores in `app/api/admin/[ideaId]/final-decision/route.ts` (if exists)
  - Confirm Final Decision route only updates idea.status and decision fields
  - Confirm scores are NOT queried or modified in this route
  - Confirm timestamps (createdAt, updatedAt) on scores are NOT touched
  - Add comment in code: "Scores persist independently; not modified by Final Decision"

- [ ] T029 Test User Story 5: Score Retention After Decision
  - Score an idea at multiple review stages (2-3 reviewers per dimension)
  - Record original scores and createdAt timestamps
  - Make Final Decision (Accept)
  - Query database: verify all scores remain unchanged
  - Submitter views score summary: verify scores are visible
  - Check rejected ideas: verify scores also persist for rejected ideas
  - Verify createdAt timestamps on scores are unchanged (not reset)
  - Test data integrity: scores linked to correct ideaId

**Checkpoint**: US5 complete. Scores persist permanently after Final Decision.

---

## Phase 8: Integration & Polish

**Purpose**: Cross-cutting concerns, regression testing, documentation

### Regression Testing

- [ ] T030 Test all Phase 1-6 functionality (backward compatibility)
  - Verify multi-stage review pipeline still works (Initial Screening → Technical Review → Business Impact Review → Final Decision)
  - Verify ideas without scores work normally (scores are optional)
  - Verify admin review panel loads and functions without errors
  - Verify submitter dashboard displays non-scored ideas correctly
  - Verify stage comment form still works (not affected by score inputs)
  - Verify admin approval/rejection workflow unaffected by scores
  - Run existing test suite if available; verify no new failures

- [ ] T031 Test multi-reviewer scoring aggregation
  - Create 3 reviewers, each score same idea different dimensions
  - Reviewer A: Innovation=4, Feasibility=5, Business Impact=3
  - Reviewer B: Innovation=5, Feasibility=4, Business Impact=5
  - Reviewer C: Innovation=4, Feasibility=4, Business Impact=4
  - Verify submitter sees aggregated: Innovation=4.33, Feasibility=4.33, Business Impact=4
  - Verify aggregation logic handles missing scores correctly
  - Test with asymmetric scoring (one reviewer scores only one dimension)

- [ ] T032 Test score visibility across user roles
  - Admin should see all scores in review panel
  - Submitter should see aggregated scores only for own ideas after decision
  - Submitter should NOT see scores for other users' ideas
  - Submitter should NOT see scores during review (before decision)
  - Test authorization by spoofing different user IDs in API calls

- [ ] T033 Test API error handling and edge cases
  - POST with invalid dimension: should return 400
  - POST with score value 0, 6, -1, 1.5: should return 400
  - POST with non-existent idea ID: should return 404
  - POST as non-admin user: should return 403
  - GET on non-existent idea: should return 404
  - Score-summary on non-decided idea: should return 403
  - Score-summary as wrong user: should return 403
  - Verify proper HTTP status codes and error messages

### Performance & Optimization

- [ ] T034 [P] Optimize database queries with indexes
  - Verify indexes on ideaId, reviewedBy, (ideaId, dimension) exist (created in T001)
  - Test query performance: GET /api/admin/[ideaId]/score with 100+ scores
  - Benchmark: should return <100ms
  - Monitor database lock issues on SQLite (consider if needed for Phase 8)

- [ ] T035 [P] Optimize React component rendering
  - Use React.memo on ScoreInput and ScoreSummary to prevent unnecessary re-renders
  - Verify useScoreUpdate and useScoreFetch hooks don't cause excessive re-fetches
  - Profile component render times with React DevTools
  - Target: submitter dashboard score summary should render <2s

### Documentation

- [ ] T036 Document scoring system for admins in `docs/SCORING-ADMIN.md`
  - How to access score input in review panel
  - How to enter scores (1-5 range per dimension)
  - How to edit scores before Final Decision
  - How to verify scores were saved
  - Best practices: when to score, how to interpret scores
  - Troubleshooting: "Scores not saving?" → check draft status, validate range

- [ ] T037 Document scoring system for submitters in `docs/SCORING-SUBMITTER.md`
  - Where to view final score summary (after decision)
  - How to interpret aggregated scores
  - What to do if no scores visible (idea not decided yet)
  - Privacy: submitters cannot see individual reviewer scores, only aggregate
  - Use scores for feedback on future submissions

- [ ] T038 Update project README with scoring system overview
  - Brief feature description: "Phase 7 adds multi-dimensional scoring to review pipeline"
  - Link to admin and submitter documentation
  - Tech stack used: Prisma IdeaScore model, API endpoints, React components

### Final Validation

- [ ] T039 Create comprehensive QA checklist in `specs/007-scoring-system/checklists/qa-checklist.md`
  - Test matrix: all 5 user stories × all review stages
  - Validation checklist: FR-001 through FR-012 (12 functional requirements)
  - Regression checklist: Phase 1-6 features
  - Edge case checklist: drafts, multiple reviewers, status transitions
  - Performance checklist: API response times, component render times

- [ ] T040 Verify no data leakage or security issues
  - Confirm submitters cannot see scores until post-decision (authorization check)
  - Confirm non-admins cannot create/update scores (authentication check)
  - Confirm reviewedBy field correctly tracks admin user ID
  - Test with different user sessions/tokens: verify score visibility rules hold
  - Check API responses: no excess data leakage (e.g., hidden admin emails in responses)

**Checkpoint**: Phase 7 Scoring System complete. All user stories implemented and tested. Backward compatibility verified. Documentation complete.

---

## Dependency Graph & Parallel Execution

### Critical Path (Sequential)
```
T001 (Schema) → T002 (Migration) → T007-T012 (API & Components) 
→ T014 (US1 Integration) → T016 (US1 Testing)
```

### Parallel Opportunities (can run simultaneously)
- T003, T004, T005, T006: Utilities and types (after T001, parallel to T002)
- T010, T011, T012: React components and hooks (parallel, after T009)
- T017, T023, T027: US2, US4, US5 implementation (parallel, after T016)
- T030-T038: Testing and documentation (parallel in Phase 8)

### Per-User-Story Independence
- **US1** depends on: T001-T013 (database and foundational APIs)
- **US2** depends on: US1 + T017-T018 (score updates)
- **US3** depends on: US1 + US2 + T020-T021 (submitter visibility)
- **US4** depends on: T001-T013 (draft validation)
- **US5** depends on: US1 + verification of cascade behavior

### Suggested MVP Scope
**Phase 7 MVP** = US1 + US2 + US3 (all P1 stories)
- Enables: Admins score ideas, edit scores, submitters see final scores
- Delivery: ~2 weeks for full implementation and testing
- Includes: All database, API, and component work (T001-T022)
- Excludes: US4/US5 validation (can add in Phase 8 polish)

---

## Phase 0-6 Continuity ✅

**Verification**: Following implementation, verify:
- [ ] All existing review pipeline stages work without errors
- [ ] Submitter dashboard displays non-decided ideas correctly
- [ ] Admin approval/rejection workflows unaffected
- [ ] Database queries on Idea model include new scores relation (if used)
- [ ] No breaking changes to API routes in Phase 1-6 features
- [ ] TypeScript compilation passes with strict mode (no `any` types)
- [ ] ESLint validates new code without warnings
- [ ] No npm dependency conflicts (no new packages added)

---

## Success Criteria Summary

Upon completion of Phase 7, the system should:
- ✅ Allow admins to enter 1-5 scores across three dimensions at all review stages
- ✅ Persist scores immediately to SQLite database via Prisma
- ✅ Enable score editing before Final Decision, with updates reflecting in database
- ✅ Show aggregated score summary to submitters only after decision
- ✅ Prevent scoring of draft ideas (validation at API and UI)
- ✅ Retain scores permanently after Final Decision (no data loss)
- ✅ Support multiple reviewers scoring same idea (per-admin tracking)
- ✅ Validate score range (1-5) with user-friendly error messages
- ✅ Maintain backward compatibility with all Phase 1-6 features
- ✅ Load admin review panel in <2s, API responses in <100ms
- ✅ Follow clean code principles (reusable components, utility functions, strict TypeScript)

---

## File Manifest

**New Files to Create**:
- `lib/scoring-validation.ts` - Validation utilities
- `lib/scoring-aggregation.ts` - Aggregation utilities
- `lib/score-queries.ts` - Prisma query helpers
- `lib/scoring-types.ts` - TypeScript types
- `lib/hooks/useScoreUpdate.ts` - Save scores hook
- `lib/hooks/useScoreFetch.ts` - Fetch scores hook
- `lib/hooks/useScoreSummary.ts` - Fetch aggregated scores hook
- `components/score-input.tsx` - Score input component
- `components/score-summary.tsx` - Score summary component
- `app/api/admin/[ideaId]/score/route.ts` - Score CRUD endpoint
- `app/api/ideas/[ideaId]/score-summary/route.ts` - Aggregated score endpoint
- `prisma/migrations/[timestamp]_add_scoring/migration.sql` - Database migration

**Modified Files**:
- `prisma/schema.prisma` - Add IdeaScore model and ScoringDimension enum
- `components/review-pipeline.tsx` - Integrate ScoreInput component
- `components/submitter-dashboard.tsx` - Integrate ScoreSummary component
- `components/admin-ideas-panel.tsx` - Optional: show score indicators

**Documentation Files**:
- `docs/SCORING-ADMIN.md` - Admin guide
- `docs/SCORING-SUBMITTER.md` - Submitter guide
- `specs/007-scoring-system/checklists/qa-checklist.md` - QA checklist

---

**Total Task Count**: 40 tasks
- Phase 1 Setup: 6 tasks
- Phase 2 Foundational: 7 tasks
- Phase 3 (US1): 3 tasks
- Phase 4 (US2): 3 tasks
- Phase 5 (US3): 3 tasks
- Phase 6 (US4): 3 tasks
- Phase 7 (US5): 3 tasks
- Phase 8 Integration & Polish: 9 tasks

**Estimated Timeline**: 
- Phase 1-2: 2-3 days (setup and foundational work)
- Phase 3-7: 7-10 days (user story implementation, 3-4 stories per week with parallel work)
- Phase 8: 2-3 days (testing, optimization, documentation)
- **Total**: ~2-3 weeks for complete feature with full QA
