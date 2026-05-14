---
title: Phase 7 Scoring System - Regression & QA Checklist
updated: 2025-01-15
---

# Phase 7 Scoring System - QA & Regression Testing

## Phase 1-6 Backward Compatibility Verification

### Multi-Stage Review Pipeline
- [ ] Initial Screening stage loads correctly
- [ ] Technical Review stage functions without scoring errors
- [ ] Business Impact Review stage allows navigation
- [ ] Final Decision stage transitions complete successfully
- [ ] Stage advance/retreat buttons work (non-scoring flow)
- [ ] Stage comments still function independently

### Ideas Without Scores
- [ ] Admin can view ideas with no scores (scores optional)
- [ ] Ideas display correctly in review pipeline without error
- [ ] Submitter dashboard shows ideas with no scores
- [ ] Final Decision works on unscored ideas

### Blind Review Masking
- [ ] Initial Screening hides submitter email (blind)
- [ ] Technical Review shows submitter email (non-blind)
- [ ] Submitter email reveals correctly post-decision
- [ ] No score information in blind stages

### Admin Review Panel
- [ ] Idea card loads with all fields
- [ ] Stage comments render correctly
- [ ] Evaluation comments display properly
- [ ] File attachments show with preview/download
- [ ] No performance regressions (page load <2s)

---

## Phase 7 Scoring System - Core Functionality

### User Story 1: Admin Scores at Technical Review
- [ ] ScoreInput renders for each dimension (Innovation, Feasibility, Business Impact)
- [ ] Score input accepts values 1-5
- [ ] Score input rejects values 0, 6, -1, 1.5, non-numeric
- [ ] Save button persists score to database
- [ ] Success message displays after save
- [ ] Error message displays on failure
- [ ] Score persists after page reload
- [ ] Database record created with correct dimension and value

### User Story 2: Admin Updates Scores Before Final Decision
- [ ] Existing scores pre-populate in inputs on page load
- [ ] Updating a score saves new value
- [ ] Multiple updates to same dimension work
- [ ] Score updates show loading state
- [ ] Updated scores visible after refresh
- [ ] Edit at Technical Review stage works
- [ ] Edit at Business Impact Review stage works
- [ ] Cannot edit after Final Decision (defensive)

### User Story 3: Submitter Views Score Summary After Decision
- [ ] Score summary displays for "accepted" ideas
- [ ] Score summary displays for "rejected" ideas
- [ ] Score summary hidden for "submitted" ideas
- [ ] Score summary shows aggregated (average) scores
- [ ] Three dimensions display: Innovation, Feasibility, Business Impact
- [ ] "—" displays for missing dimensions
- [ ] Summary styling responsive (mobile/desktop)
- [ ] Submitter cannot see other users' scores

### User Story 4: Draft Scoring Prevention
- [ ] POST /api/admin/[draftId]/score returns 409 Conflict
- [ ] Error message: "Cannot score draft ideas"
- [ ] Draft ideas not scoreable via API
- [ ] ScoreInput shows defensive message for drafts
- [ ] Score input fields disabled if isDraft=true
- [ ] Non-draft ideas still scoreable (positive test)

### User Story 5: Score Retention After Final Decision
- [ ] Scores remain after idea status changes to "accepted"
- [ ] Scores remain after idea status changes to "rejected"
- [ ] Score createdAt timestamps unchanged
- [ ] Score updatedAt reflects correct edit time
- [ ] Multiple reviewers' scores all persist
- [ ] Score count unchanged: before decision = after decision

---

## API Endpoint Validation

### POST /api/admin/[ideaId]/score
- [ ] Valid score 1-5 returns 200 with score object
- [ ] Invalid score 0 returns 400
- [ ] Invalid score 6 returns 400
- [ ] Invalid score non-numeric returns 400
- [ ] Missing dimension returns 400
- [ ] Invalid dimension returns 400
- [ ] Non-existent idea returns 404
- [ ] Draft idea returns 409
- [ ] Non-admin user returns 403
- [ ] Unauthenticated request returns 403
- [ ] Score creates or updates (idempotent)

### GET /api/admin/[ideaId]/score
- [ ] Returns array of all scores for idea
- [ ] Includes reviewer user info (id, email)
- [ ] Ordered by dimension then createdAt
- [ ] Non-existent idea returns 404
- [ ] Non-admin user returns 403
- [ ] Unauthenticated request returns 403

### GET /api/ideas/[ideaId]/score-summary
- [ ] Returns aggregated scores for "accepted" idea
- [ ] Returns aggregated scores for "rejected" idea
- [ ] Returns 403 for "submitted" idea (not decided)
- [ ] Returns 403 for "draft" idea
- [ ] Submitter can see own idea scores post-decision
- [ ] Submitter cannot see other users' ideas
- [ ] Response includes innovation, feasibility, businessImpact (null if no scores)
- [ ] Non-authenticated request returns 403
- [ ] Non-existent idea returns 404

---

## Multi-Reviewer Aggregation

### Aggregation Logic
- [ ] 2 reviewers score INNOVATION: 4, 5 → average 4.5
- [ ] 3 reviewers score INNOVATION: 4, 5, 4 → average 4.33 (rounded to .5 increments or raw)
- [ ] 1 reviewer scores FEASIBILITY, others don't → shows average of 1
- [ ] No reviewers score BUSINESS_IMPACT → shows null
- [ ] Asymmetric scoring (reviewers score different dimensions) works correctly
- [ ] Score order in response doesn't affect aggregation

### Reviewer Independence
- [ ] Reviewer A can score all dimensions
- [ ] Reviewer B can score different dimensions
- [ ] Both reviewers' scores visible to admin
- [ ] Both reviewers' scores aggregated for submitter
- [ ] Removing one reviewer's score recalculates average
- [ ] Adding new reviewer's score updates average

---

## Authorization & Security

### Admin-Only Endpoints
- [ ] POST /api/admin/[ideaId]/score: Admin can create (200), submitter cannot (403)
- [ ] GET /api/admin/[ideaId]/score: Admin can read (200), submitter cannot (403)

### Submitter Visibility Rules
- [ ] GET /api/ideas/[ideaId]/score-summary: Submitter sees own post-decision (200)
- [ ] GET /api/ideas/[ideaId]/score-summary: Submitter sees own pre-decision (403)
- [ ] GET /api/ideas/[ideaId]/score-summary: Submitter sees other's any status (403)

### Data Leakage Prevention
- [ ] Admin responses don't include excessive user data (emails OK, passwords NO)
- [ ] Submitter can't see individual reviewer scores, only aggregate
- [ ] Submitter can't see who scored what
- [ ] No score data in public API responses

---

## Component Rendering

### ScoreInput Component
- [ ] Renders dimension label correctly
- [ ] Input accepts 1-5 range
- [ ] Save button disabled when empty
- [ ] Save button enabled with value 1-5
- [ ] Shows loading state during save
- [ ] Shows error message on validation
- [ ] Shows success message after save
- [ ] isDraft prop hides input and shows message

### ScoreSummary Component
- [ ] Shows 3-column grid layout
- [ ] Displays Innovation score
- [ ] Displays Feasibility score
- [ ] Displays Business Impact score
- [ ] Shows "—" for null scores
- [ ] Responsive on mobile (stacks to single column)
- [ ] Responsive on desktop (3-column grid)
- [ ] Responsive on tablet (2-3 columns)
- [ ] Shows loading skeleton
- [ ] Loading prop respected

### IdeaScoreSection Component
- [ ] Renders three ScoreInput fields for non-draft ideas
- [ ] Shows draft message for draft ideas
- [ ] Loading skeleton displays while fetching scores
- [ ] Pre-populates inputs with existing scores
- [ ] Refetches scores after save

### SubmitterIdeaCard Component
- [ ] Wraps IdeaCard correctly
- [ ] Shows ScoreSummary for "accepted" ideas
- [ ] Shows ScoreSummary for "rejected" ideas
- [ ] Hides ScoreSummary for other statuses
- [ ] Loading state for score summary
- [ ] Error state handled

---

## Custom Hooks

### useScoreFetch Hook
- [ ] Fetches scores on mount
- [ ] Organizes scores by dimension
- [ ] Returns most recent score per dimension
- [ ] Refetch function available
- [ ] Loading state managed
- [ ] Error state managed
- [ ] Handles 404 (no scores)

### useScoreUpdate Hook
- [ ] Saves score via POST
- [ ] Manages loading state
- [ ] Manages error state
- [ ] Throws on error for caller handling
- [ ] Returns IdeaScore object

### useScoreSummary Hook
- [ ] Only fetches for "accepted"/"rejected" status
- [ ] Returns null for other statuses
- [ ] Returns aggregated scores {innovation, feasibility, businessImpact}
- [ ] Refetches when status changes
- [ ] Error handling for 403, 404
- [ ] Loading state managed

---

## Database Integrity

### IdeaScore Model Constraints
- [ ] Unique constraint: (ideaId, dimension, reviewedBy) enforced
- [ ] Duplicate insert attempt fails (409 or ignored)
- [ ] Update to existing score works (upsert)
- [ ] Cascade delete on idea deletion
- [ ] Restrict delete on user deletion (prevents orphans)
- [ ] Indexes exist: ideaId, (ideaId, dimension), reviewedBy

### Data Types
- [ ] value field stores 1-5 integers
- [ ] dimension field stores enum values
- [ ] createdAt/updatedAt timestamps correct
- [ ] reviewedBy field references correct user

---

## Performance Benchmarks

### Query Performance
- [ ] GET /api/admin/[ideaId]/score with 100+ scores: <100ms
- [ ] GET /api/ideas/[ideaId]/score-summary with 100+ scores: <100ms
- [ ] ScoreInput save: <500ms
- [ ] useScoreFetch initial load: <500ms

### Component Rendering
- [ ] ScoreInput renders: <100ms
- [ ] ScoreSummary renders: <100ms
- [ ] IdeaScoreSection renders: <200ms
- [ ] Submitter dashboard with 10+ ideas: <2s

### React Optimization
- [ ] ScoreInput uses React.memo (no unnecessary re-renders)
- [ ] ScoreSummary uses React.memo (no unnecessary re-renders)
- [ ] Hooks don't cause infinite loops
- [ ] useEffect dependencies correct

---

## Edge Cases & Error Handling

### Empty/Null States
- [ ] Idea with no scores: displays correctly
- [ ] User with no ideas: "No ideas submitted yet"
- [ ] Score summary all nulls: "—" displays for each
- [ ] API error responses: user-friendly messages

### Concurrent Operations
- [ ] Two admins score same idea simultaneously: both persist
- [ ] Admin updates while submitter views: consistency maintained
- [ ] Multiple score saves in rapid succession: all persist

### Browser/Network Errors
- [ ] Network timeout on save: error message shown
- [ ] 500 error from API: error message shown
- [ ] Invalid JSON response: handled gracefully
- [ ] No network: error state managed

---

## Documentation Completeness

- [ ] SCORING-ADMIN.md exists with admin workflow
- [ ] SCORING-SUBMITTER.md exists with submitter workflow  
- [ ] Code comments explain score persistence
- [ ] API documentation updated
- [ ] README mentions Phase 7 scoring

---

**Test Date**: _______________  
**Tester**: _______________  
**Result**: ☐ PASS ☐ FAIL  
**Issues Found**: _______________
