# Feature Specification: Phase 4 Draft Management

**Feature Branch**: `004-draft-management`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Add Phase 4 Draft Management to InnovatEPAM Portal.

Requirements:
- Submitters can save ideas as drafts
- Drafts can be edited later before final submission
- Drafts are visible only to the owner submitter
- Drafts are not visible in admin review queues
- Submitters can delete drafts
- Final submission converts draft into submitted idea
- Submitted ideas become read-only for submitters
- Existing Phase 1-3 functionality must continue working"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save and Resume Drafts (Priority: P1)

As a submitter, I can save an unfinished idea as a draft and return later to continue editing it so that I do not lose work when I am not ready to submit.

**Why this priority**: Draft saving is the core value of this phase. Without save-and-resume behavior, Phase 4 does not deliver meaningful user benefit.

**Independent Test**: Can be fully tested by signing in as a submitter, creating a partial idea, saving it as a draft, reopening it later, and confirming the entered data is preserved and still editable.

**Acceptance Scenarios**:

1. **Given** a submitter is creating an idea, **When** they save it as a draft, **Then** the system stores the draft without requiring final submission.
2. **Given** a submitter has a saved draft, **When** they reopen it later, **Then** the previously saved content is restored for editing.
3. **Given** a submitter edits a saved draft, **When** they save again, **Then** the system updates the existing draft rather than creating a duplicate idea.

---

### User Story 2 - Keep Drafts Private and Manageable (Priority: P1)

As a submitter, I can see and delete only my own drafts, and admins do not see them in review queues, so that unfinished work stays private until I choose to submit it.

**Why this priority**: Privacy and correct queue visibility are essential for safe draft behavior. If drafts appear in admin review, the workflow becomes misleading and incorrect.

**Independent Test**: Can be tested by saving a draft as a submitter, verifying it is visible in that submitter's workspace, confirming it does not appear in admin review, and deleting it successfully.

**Acceptance Scenarios**:

1. **Given** a submitter has saved drafts, **When** they view their idea workspace, **Then** only that submitter can see those drafts.
2. **Given** one submitter has saved drafts, **When** an admin opens the review queue, **Then** drafts are excluded from all admin review views.
3. **Given** a submitter owns a draft, **When** they delete it, **Then** the draft is removed and no longer available in their draft list.

---

### User Story 3 - Finalize Drafts Into Submitted Ideas (Priority: P2)

As a submitter, I can finalize a draft into a submitted idea, after which it becomes read-only to me, so that the review process starts from a stable submitted record.

**Why this priority**: Final submission from draft is necessary to complete the lifecycle, but it depends on draft creation and management already existing.

**Independent Test**: Can be tested by saving a draft, completing required fields, submitting it, verifying it appears in the admin queue as a submitted idea, and confirming the submitter can no longer edit it.

**Acceptance Scenarios**:

1. **Given** a submitter has a valid draft, **When** they perform final submission, **Then** the draft is converted into a submitted idea.
2. **Given** a draft has been finally submitted, **When** the owner views that idea afterward, **Then** the idea is read-only for the submitter.
3. **Given** a draft is converted into a submitted idea, **When** an admin opens the review queue, **Then** the idea appears as a normal submitted item and existing review workflows continue to work.

---

### Edge Cases

- If a submitter saves a draft with incomplete required submission fields, the system preserves the draft but does not treat it as a submitted idea.
- If a submitter attempts final submission from a draft that still fails required validation, the system blocks submission and preserves the editable draft.
- If a submitter deletes a draft, the system removes it without affecting already submitted ideas.
- If a submitter has both drafts and submitted ideas, the system clearly distinguishes editable drafts from read-only submitted items.
- If an older Phase 1-3 submitted idea has no draft history, it remains visible and unchanged in existing submitter and admin flows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow submitters to save new ideas as drafts without requiring final submission validation.
- **FR-002**: System MUST allow submitters to reopen and edit their saved drafts before final submission.
- **FR-003**: System MUST persist updates to an existing draft instead of creating duplicate draft records for the same in-progress idea.
- **FR-004**: System MUST display drafts only to the submitter who owns them.
- **FR-005**: System MUST exclude drafts from all admin review queues and admin review actions.
- **FR-006**: System MUST allow a submitter to delete a draft they own.
- **FR-007**: System MUST allow final submission of a valid draft, converting it into a submitted idea.
- **FR-008**: System MUST apply normal final-submission validation rules when a draft is converted into a submitted idea.
- **FR-009**: System MUST preserve draft data when final submission fails validation so the submitter can continue editing.
- **FR-010**: System MUST make submitted ideas read-only for submitters after final submission.
- **FR-011**: System MUST continue to enforce existing role-based access boundaries for submitter and admin users.
- **FR-012**: System MUST preserve existing Phase 1, Phase 2, and Phase 3 functionality without behavioral regression.
- **FR-013**: System MUST support draft behavior for ideas that include existing Phase 2 dynamic fields and Phase 3 attachment capabilities.
- **FR-014**: System MUST distinguish editable drafts from submitted ideas in the submitter experience.

### Key Entities *(include if feature involves data)*

- **Draft Idea**: An in-progress idea owned by a submitter that can be saved, reopened, edited, or deleted before final submission.
- **Submitted Idea**: A finalized idea that has entered the admin review workflow and is no longer editable by the submitter.
- **Draft Visibility Rule**: The ownership rule that restricts draft visibility to the owning submitter and keeps drafts out of admin review flows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sampled submitter draft saves preserve entered data for later editing.
- **SC-002**: 100% of sampled drafts remain invisible in admin review views before final submission.
- **SC-003**: Submitters can reopen and continue editing a saved draft in under 30 seconds for 95% of local/manual validation attempts.
- **SC-004**: 100% of valid final submissions from drafts appear in the admin review queue as submitted ideas.
- **SC-005**: Existing Phase 1-3 critical flows remain fully executable in regression validation after draft management is added.

## Assumptions

- Existing authentication and role model remain unchanged.
- Drafts are owned by a single submitter and are not shared collaboratively in this phase.
- Final submission from a draft uses the same business validation rules as direct submission.
- Submitted ideas remain immutable for submitters after final submission, while admins retain existing review capabilities.
- Existing Phase 2 dynamic fields and Phase 3 attachment behavior remain available within drafts unless explicitly blocked by future phases.
