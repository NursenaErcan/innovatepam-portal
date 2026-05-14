# Feature Specification: Phase 7 Scoring System

**Feature Branch**: `007-scoring-system`

**Created**: May 14, 2026

**Status**: Draft

**Input**: User description: "Add Phase 7 Scoring System to InnovatEPAM Portal. Requirements: Admins can score ideas during the review process. Scoring should use 1–5 ratings. Score dimensions: Innovation, Feasibility, Business Impact. Scores can be added or updated by admins before final decision. Scores are visible to admins. Submitters can see final score summary only after Final Decision. Drafts cannot be scored. Accepted/rejected ideas keep their scores. Existing Phase 1-6 functionality must continue working."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Scores Idea at Technical Review Stage (Priority: P1)

Admin reviewer proceeds through the multi-stage review pipeline and needs to evaluate the quality of an idea across multiple dimensions. During Technical Review, Admin inputs numerical scores that reflect the idea's merits on innovation, feasibility, and business impact dimensions. Scores are immediately persisted and visible in the reviewer's session.

**Why this priority**: Scoring during intermediate review stages is the core MVP feature. Without this, the entire scoring system has no value. It enables technical reviewers to provide quantitative feedback on ideas.

**Independent Test**: Can be fully tested by: Admin navigates to an idea in Technical Review stage, adds 1-5 ratings for Innovation/Feasibility/Business Impact, saves scores, and immediately sees the scores reflected in the same session. This alone demonstrates functional scoring capability.

**Acceptance Scenarios**:

1. **Given** an idea in Technical Review stage with no scores, **When** admin opens the review panel, **Then** three input fields appear for Innovation, Feasibility, and Business Impact, each allowing 1-5 integer selection
2. **Given** admin has entered scores, **When** admin clicks Save or proceeds to next stage, **Then** scores are persisted to database and error messages are suppressed
3. **Given** admin enters a score outside 1-5 range, **When** admin attempts to save, **Then** validation error displays and save is prevented
4. **Given** an idea with existing scores, **When** admin returns to review, **Then** previously entered scores are pre-populated and editable

---

### User Story 2 - Admin Updates Scores Before Final Decision (Priority: P1)

Admin may need to revisit and update scores as more information becomes available or as a result of peer discussion. Scores must remain editable by admins throughout the review pipeline until the Final Decision is made and recorded.

**Why this priority**: Editability before final decision is essential for iterative review workflows. Reviewers need the ability to refine their assessments. Once a decision is made, scores are locked.

**Independent Test**: Can be fully tested by: Admin enters initial scores at Technical Review, navigates back, updates one or more scores, saves, and verifies new values persist in database.

**Acceptance Scenarios**:

1. **Given** an idea with existing scores before Final Decision, **When** admin opens the idea for review again, **Then** score fields are editable and current values are pre-populated
2. **Given** admin modifies a score from 4 to 3, **When** admin saves, **Then** database reflects the new score value
3. **Given** an idea in Final Decision stage with no decision yet, **When** admin updates scores, **Then** scores persist and do not prevent final decision action

---

### User Story 3 - Submitter Views Final Score Summary After Decision (Priority: P1)

After an idea has been decided (accepted or rejected), the submitter should be able to see the final aggregated score to understand the quantitative feedback from the review panel. This summary provides transparency and learning value.

**Why this priority**: Providing score feedback to submitters is a primary business requirement. It gives submitters actionable feedback for future submissions and demonstrates fairness of the process.

**Independent Test**: Can be fully tested by: Idea is accepted/rejected at Final Decision, submitter logs in, navigates to submitter dashboard, opens the decided idea, and sees a score summary showing aggregated ratings across Innovation, Feasibility, and Business Impact.

**Acceptance Scenarios**:

1. **Given** an idea with status "accepted" or "rejected" and recorded scores, **When** submitter views the idea in submitter dashboard, **Then** a score summary section is visible showing average or aggregate Innovation/Feasibility/Business Impact scores
2. **Given** an idea is "submitted" or in any pre-decision stage, **When** submitter views the idea, **Then** score summary is not visible (hidden until decision is made)
3. **Given** multiple reviewers have scored the same idea, **When** submitter views the summary, **Then** aggregated score (e.g., average) is displayed as a single value per dimension

---

### User Story 4 - Admin Cannot Score Draft Ideas (Priority: P2)

Draft ideas are not yet formally submitted and should not be eligible for scoring. This prevents incomplete work from entering the review pipeline and ensures scoring applies only to formally submitted ideas.

**Why this priority**: Protects workflow integrity. Drafts are never visible to admins (Phase 4 feature), so they should not have scoring capabilities. This is a validation constraint rather than a core feature.

**Independent Test**: Can be fully tested by: Admin attempts to access a draft idea (though it should not be visible in admin queue), or system prevents score creation on draft status ideas.

**Acceptance Scenarios**:

1. **Given** an idea with status "draft", **When** admin attempts to add scores via API or UI, **Then** request is rejected with validation error
2. **Given** an idea is draft, **When** submitter converts it to submitted, **Then** scores table entry is created in database (empty/null scores for new submission)

---

### User Story 5 - Accepted/Rejected Ideas Retain Scores (Priority: P2)

Once an idea receives a final decision (accepted or rejected), the scores that led to that decision should remain permanently associated with the idea for historical and audit purposes.

**Why this priority**: Data integrity and audit trail. Even after a decision is made, scores provide a record of why the decision was reached.

**Independent Test**: Can be fully tested by: Admin scores an idea, makes Final Decision, checks database directly to confirm scores persist unchanged even after status change to accepted/rejected.

**Acceptance Scenarios**:

1. **Given** an idea with scores that receives an Accept decision, **When** database is queried, **Then** scores remain unchanged in associated record
2. **Given** an idea with scores that receives a Reject decision, **When** submitter views score summary, **Then** scores are visible despite rejected status

---

### Edge Cases

- What happens when an admin navigates away from a review form with unsaved score changes? → Changes are lost; explicit save required.
- What happens if multiple admins score the same idea? → Scores are stored per admin (or scores overwrite); aggregation during submitter view handles multiple reviewers.
- What happens if an idea is moved backward in the pipeline (e.g., from Technical Review back to Initial Screening)? → Scores persist; reviewers can add/update scores at each stage.
- How are scores handled if an idea is resubmitted after rejection? → New submission creates new scores table entry; old scores are retained for audit but are not visible to submitter for the new submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to enter 1-5 integer ratings for three scoring dimensions: Innovation, Feasibility, and Business Impact
- **FR-002**: System MUST persist scores to database immediately upon save or stage transition
- **FR-003**: System MUST validate score input is integer and within range 1-5; reject out-of-range values with user-facing error
- **FR-004**: System MUST allow admins to edit scores at any review stage before Final Decision is recorded
- **FR-005**: System MUST prevent score entry on ideas with status "draft"
- **FR-006**: System MUST compute aggregate score summary (e.g., average across three dimensions) visible to submitter only after idea status is "accepted" or "rejected"
- **FR-007**: System MUST display score summary in submitter dashboard for decided ideas (accepted/rejected status)
- **FR-008**: System MUST retain scores on ideas after Final Decision is made (scores do not change or disappear)
- **FR-009**: System MUST include score input fields in admin review panel at all review stages (Initial Screening, Technical Review, Business Impact Review, Final Decision)
- **FR-010**: System MUST support multiple admins scoring the same idea; final submitter view aggregates all scores
- **FR-011**: System MUST pre-populate score fields when admin returns to an idea with existing scores
- **FR-012**: System MUST include scores in audit logs and idea history (optional enhancement, not blocking)

### Key Entities *(include if feature involves data)*

- **IdeaScore**: Relational record linking an Idea to its scores. Contains ideaId, dimensionType (Innovation/Feasibility/Business Impact), ratingValue (1-5 integer), reviewedBy (admin), createdAt, updatedAt. Supports multiple score entries per idea to track different reviewers.
- **Idea (extended)**: Existing Idea entity gains relationship to IdeaScore records. Query `idea.scores` returns all associated score records. Score submission happens before or during review, not at submission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can input scores for submitted ideas in under 30 seconds per idea
- **SC-002**: Score persistence is immediate and 100% accurate (no lost or corrupted data)
- **SC-003**: Submitter score summary displays within 2 seconds of opening decided idea
- **SC-004**: 95% of submitted ideas receive scores by Final Decision stage
- **SC-005**: Score validation prevents all out-of-range submissions
- **SC-006**: All Phase 1-6 functionality continues to work without regression (backward compatibility)
- **SC-007**: Submitter score visibility is restricted to post-decision only; no score leakage during review stages

## Assumptions

- Scoring is admin-only; submitters cannot score ideas (they can only view final summary post-decision)
- Aggregate score calculation uses simple average across multiple reviewers; weighted or custom aggregation is out of scope for Phase 7
- Score input fields appear inline in review panel alongside existing stage comment form; no separate scoring UI required
- Scores are optional during review (admins can complete review without scoring); enforcing mandatory scoring is out of scope
- Each review stage can have scores added/updated; scores from previous stages are not overwritten but accumulated
- Scores persist even if idea is moved backward in pipeline (for audit trail purposes)
- Drafts and ideas in "under_review" status during non-decision workflows do not appear in admin view, so draft scoring prevention is enforced by existing Phase 4 draft filtering
- Existing Prisma schema extension required (new IdeaScore model); no architectural changes to existing models needed beyond adding foreign key reference
