# Feature Specification: Phase 5 Multi-Stage Review

**Feature Branch**: `005-multi-stage-review`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Add Phase 5 Multi-Stage Review to InnovatEPAM Portal.

Requirements:
- Admin review should use multiple stages instead of a single status update.
- Review stages should be: Initial Screening, Technical Review, Business Impact Review, Final Decision.
- Admins can move an idea forward or backward between review stages.
- Admins can add stage-specific evaluation comments.
- Submitters can see the current review stage and admin feedback.
- Draft ideas are excluded from the review pipeline.
- Accepted and rejected ideas are final states.
- Existing Phase 1-4 functionality must continue working."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Advances Idea Through Review Stages (Priority: P1)

As an admin, I can move a submitted idea through four defined review stages so that each idea receives a structured, consistent evaluation before a final decision is made.

**Why this priority**: This is the core behavior of Phase 5. Without stage progression, the multi-stage review pipeline does not exist.

**Independent Test**: Can be fully tested by submitting an idea, opening it in the admin panel, advancing it through each stage sequentially, and confirming the stage updates correctly at each step.

**Acceptance Scenarios**:

1. **Given** a submitted idea is at the Initial Screening stage, **When** an admin advances it, **Then** the idea moves to Technical Review.
2. **Given** a submitted idea is at Technical Review, **When** an admin advances it, **Then** the idea moves to Business Impact Review.
3. **Given** a submitted idea is at Business Impact Review, **When** an admin advances it, **Then** the idea moves to Final Decision.
4. **Given** a submitted idea is at any non-final stage, **When** an admin moves it backward, **Then** the idea returns to the previous stage.
5. **Given** an idea is in the Accepted or Rejected final state, **When** an admin views the idea, **Then** no stage-change controls are available.

---

### User Story 2 - Admin Adds Stage-Specific Evaluation Comments (Priority: P1)

As an admin, I can add evaluation comments tied to each review stage so that structured feedback is captured at every point in the review pipeline.

**Why this priority**: Stage-specific comments are the primary mechanism for documenting decisions and communicating evaluation rationale to submitters and other reviewers.

**Independent Test**: Can be tested by advancing an idea to any stage, adding a comment scoped to that stage, and confirming the comment is stored and associated with the correct stage.

**Acceptance Scenarios**:

1. **Given** an idea is in any active review stage, **When** an admin enters and saves an evaluation comment, **Then** the comment is stored and associated with that specific stage.
2. **Given** an admin adds comments at multiple stages, **When** the idea record is viewed, **Then** comments from all stages are visible in chronological order with their associated stage label.
3. **Given** an admin saves a comment at a stage and later changes the stage, **Then** the previously saved comment remains associated with the original stage and is not lost.

---

### User Story 3 - Submitter Views Current Review Stage and Feedback (Priority: P2)

As a submitter, I can see which review stage my submitted idea is currently in and read any admin feedback provided at each stage so that I stay informed about progress.

**Why this priority**: Transparency into the review process increases submitter trust and reduces the need for out-of-band status enquiries.

**Independent Test**: Can be tested by submitting an idea, advancing it through stages as an admin with comments, then viewing the idea as the submitter and confirming the current stage and all feedback are visible.

**Acceptance Scenarios**:

1. **Given** a submitter views their submitted idea, **When** the idea has an active review stage, **Then** the submitter sees the name of the current stage.
2. **Given** an admin has added evaluation comments at one or more stages, **When** the submitter views the idea, **Then** the submitter can read those comments with their associated stage labels.
3. **Given** a submitter views a draft idea, **When** drafts are not in the review pipeline, **Then** no review stage information is shown for that draft.

---

### User Story 4 - Final Decision Sets Accepted or Rejected Status (Priority: P1)

As an admin, I can mark an idea as Accepted or Rejected from the Final Decision stage so that ideas reach a clear, irreversible outcome.

**Why this priority**: Final decisions complete the review lifecycle. Without them, ideas accumulate indefinitely in the pipeline with no resolution.

**Independent Test**: Can be tested by advancing an idea to Final Decision, setting it to Accepted or Rejected, and confirming the status is final and the idea no longer appears as active in the review queue.

**Acceptance Scenarios**:

1. **Given** an idea is at the Final Decision stage, **When** an admin marks it as Accepted, **Then** the idea status becomes Accepted and no further stage changes are possible.
2. **Given** an idea is at the Final Decision stage, **When** an admin marks it as Rejected, **Then** the idea status becomes Rejected and no further stage changes are possible.
3. **Given** an idea is Accepted or Rejected, **When** an admin views the review panel, **Then** the idea no longer appears in the active review queue.

---

### User Story 5 - Draft Ideas Excluded from Review Pipeline (Priority: P2)

As an admin, I do not see draft ideas in the review queue so that only formally submitted ideas enter the review pipeline.

**Why this priority**: Preserving the Phase 4 draft privacy contract is essential for system correctness and consistent admin experience.

**Independent Test**: Can be tested by saving an idea as a draft and confirming it does not appear at any review stage in the admin panel.

**Acceptance Scenarios**:

1. **Given** a submitter has saved an idea as a draft, **When** an admin views the review queue at any stage, **Then** the draft idea is not present.
2. **Given** a submitter converts a draft to a submitted idea, **When** the admin views the review queue, **Then** the idea now appears in the Initial Screening stage.

---

### Edge Cases

- What happens when an admin tries to advance an idea that is already at the Final Decision stage without selecting Accepted or Rejected?
- How does the system handle an idea that was submitted before Phase 5 was deployed — which stage does it start in?
- What happens if an admin adds a comment without changing the stage?
- How does the system behave if two admins simultaneously attempt to change the stage of the same idea?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST assign every newly submitted idea to the Initial Screening stage upon submission.
- **FR-002**: System MUST allow admins to advance a non-final idea to the next defined review stage.
- **FR-003**: System MUST allow admins to move a non-final idea back to the previous review stage.
- **FR-004**: System MUST prevent stage changes on ideas with a final status of Accepted or Rejected.
- **FR-005**: System MUST allow admins to add text evaluation comments that are scoped to a specific review stage.
- **FR-006**: System MUST display all stage-scoped comments in chronological order on the idea detail view.
- **FR-007**: System MUST allow admins to set an idea at the Final Decision stage to Accepted or Rejected.
- **FR-008**: System MUST display the current review stage name on the idea detail view accessible to submitters.
- **FR-009**: System MUST display all stage-scoped admin comments to the submitter who owns the idea.
- **FR-010**: System MUST exclude draft ideas from the review pipeline and admin review queues.
- **FR-011**: Ideas existing prior to Phase 5 deployment MUST be automatically assigned to Initial Screening upon the feature going live.
- **FR-012**: Accepted and Rejected ideas MUST be treated as read-only with respect to review stage and status.
- **FR-013**: System MUST continue to support all Phase 1–4 functionality without regression.

### Key Entities

- **ReviewStage**: Represents a discrete stage in the review pipeline (Initial Screening, Technical Review, Business Impact Review, Final Decision). An idea holds a reference to its current stage.
- **StageComment**: A piece of evaluator feedback attached to a specific idea and a specific review stage, with a timestamp and author identity.
- **Idea (extended)**: Gains a `reviewStage` attribute and a collection of `StageComment` entries; final states (Accepted, Rejected) disable stage transitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can transition a submitted idea through all four review stages in a single session without leaving the admin interface.
- **SC-002**: Stage-specific comments submitted by an admin are visible to the submitter after navigating to the idea detail view.
- **SC-003**: 100% of submitted ideas enter the Initial Screening stage automatically; zero submitted ideas bypass the pipeline.
- **SC-004**: Draft ideas appear in the admin review queue at a rate of 0% — no draft ever surfaces in the pipeline.
- **SC-005**: Accepted and Rejected ideas are immutable with respect to review stage; zero stage-change actions succeed on final-state ideas.
- **SC-006**: All existing Phase 1–4 test scenarios continue to pass after Phase 5 is deployed.

## Assumptions

- Admins are the only user role authorized to change review stages or add stage comments; submitters have read-only visibility into review progress.
- The four review stages are fixed for Phase 5; configurable stages are out of scope.
- A single admin manages the review at each stage; concurrent multi-admin editing of the same idea stage is not a primary scenario but the system must not corrupt data if it occurs.
- Ideas submitted before Phase 5 deployment are automatically migrated to Initial Screening; no manual re-submission is required.
- Email or push notifications for stage changes and comments are out of scope for Phase 5; submitters check status by visiting the portal.
- The existing comment system from Phase 1 (general idea comments) remains in place and is separate from stage-scoped evaluation comments.
- Mobile-responsive display of review stage information is assumed but native mobile app support is out of scope.
