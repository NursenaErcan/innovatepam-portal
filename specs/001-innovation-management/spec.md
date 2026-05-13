# Feature Specification: InnovatEPAM Portal

**Feature Branch**: `[001-innovation-management]`

**Created**: 2026-05-13

**Status**: Ready for Implementation

**Input**: User description: "Build InnovatEPAM Portal, an employee innovation management platform.

MVP requirements:
- Users can register, login, and logout.
- Users have roles: submitter and admin.
- Submitters can create innovation ideas.
- Each idea has title, description, category, and one file attachment.
- Submitters can view their submitted ideas.
- Admins can view all submitted ideas.
- Admins can update idea status: submitted, under review, accepted, rejected.
- Admins can add evaluation comments.
- The app should run locally.
- Functional UI is more important than visual polish."

## Clarifications

### Session 2026-05-14

- Q: Should registration allow admin role creation? → A: No, new registrations are submitters only; admin accounts are provisioned separately.

## User Scenarios & Testing (mandatory)

### User Story 1 - Submit idea as a submitter (Priority: P1)

A registered submitter can sign in, create an innovation idea with a title, description, category, and one file attachment, then view the idea in their own submissions list.

**Why this priority**: This delivers the core employee innovation workflow and demonstrates the minimum viable product for both user account handling and idea submission.

**Independent Test**: Create a new submitter account, log in, submit an idea with a category and attachment, then verify the idea appears in the submitter's personal idea list.

**Acceptance Scenarios**:

1. **Given** a visitor is not authenticated, **when** they register with valid credentials, **then** they are able to sign in as a submitter.
2. **Given** a signed-in submitter, **when** they create a new idea with title, description, category, and one file attachment, **then** the idea is saved and visible in their own submitted ideas list.
3. **Given** a signed-in submitter who has submitted ideas, **when** they view their ideas page, **then** they see only their submitted ideas and the key idea details.
4. **Given** a signed-in submitter, **when** they choose to log out, **then** the app returns to an unauthenticated state.

---

### User Story 2 - Review ideas as an admin (Priority: P2)

An admin can sign in, view all submitted ideas from every submitter, update the status of each idea, and add evaluation comments.

**Why this priority**: Admin review completes the innovation lifecycle and enables meaningful management of submissions.

**Independent Test**: Log in as an admin, review the list of all submitted ideas, update an idea status, add a comment, and confirm the updated status and comment are displayed.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **when** they open the admin review page, **then** they see all submitted ideas from all submitters.
2. **Given** an admin reviewing an idea, **when** they change the status to under review, accepted, or rejected, **then** the idea status updates accordingly.
3. **Given** an admin reviewing an idea, **when** they add an evaluation comment, **then** the comment is saved and visible with the idea.

---

### User Story 3 - Local app usability and access control (Priority: P3)

The app must run locally, protect secure routes behind authentication, and direct users to the appropriate view based on role.

**Why this priority**: Ensures the application operates as a local MVP and enforces role-based access to submitter and admin capabilities.

**Independent Test**: Start the app locally, sign in as a submitter and verify admin screens are not accessible, sign out, then sign in as an admin and verify submitter-only content is not available.

**Acceptance Scenarios**:

1. **Given** a local development environment, **when** the app is launched, **then** users can reach the login and registration screens.
2. **Given** a submitter is authenticated, **when** they attempt to access admin review screens, **then** access is denied or redirected to their submissions page.
3. **Given** an admin is authenticated, **when** they view the app, **then** they can access the idea review dashboard and see all ideas.

---

### Edge Cases

- What happens when a submitter uploads an unsupported file type or more than one attachment? The app should prevent submission and show a clear validation message.
- How does the app behave when an already registered email is used for registration? It should show a friendly error and allow the user to choose a different email.
- How does the app handle a submitter with no submitted ideas? The idea list should show a gentle empty state explaining that no ideas have been submitted yet.
- How does the app behave when an admin updates the status of an idea that has already been accepted or rejected? The change should be allowed only if a valid status transition is selected.
- What happens when attachment storage fails after idea form validation succeeds? The idea should not be finalized, the user should see a clear retry message, and entered non-file form data should be preserved.
- What happens when an attachment file is missing from disk after submission? The app should show "file unavailable" feedback while preserving idea metadata visibility.
- How does the app behave when two admins update the same idea at nearly the same time? The system should apply last-write-wins and display the latest persisted status and comments on refresh.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: System MUST allow users to register and create authenticated accounts.
- **FR-002**: System MUST allow authenticated users to log in and log out.
- **FR-003**: System MUST support two user roles: submitter and admin.
- **FR-004**: System MUST allow submitters to create innovation ideas with a title, description, category, and one file attachment.
- **FR-005**: System MUST allow submitters to view a list of only their own submitted ideas.
- **FR-006**: System MUST allow admins to view all submitted ideas from all submitters.
- **FR-007**: System MUST allow admins to update idea status among submitted, under review, accepted, and rejected.
- **FR-008**: System MUST allow admins to add evaluation comments to each idea.
- **FR-009**: System MUST enforce role-based access so submitter actions and admin actions are separated.
- **FR-010**: System MUST create submitter accounts only through the public registration flow.
- **FR-011**: System MUST provision admin accounts separately via seeded or manual setup for local use.
- **FR-012**: System MUST be able to run locally in a developer environment.
- **FR-013**: System MUST present a functional UI for registration, login, idea submission, idea review, and status updates without requiring visual polish.
- **FR-014**: System MUST prevent submitters from submitting more than one attachment per idea.
- **FR-015**: System MUST show validation feedback for required fields and attachment requirements.

### Non-Functional Requirements

- **NFR-001**: Session cookies MUST be HttpOnly and SameSite=Lax in local MVP, and session records MUST be invalidated on logout.
- **NFR-002**: Session lifetime MUST be explicitly bounded for local MVP (default 12 hours).
- **NFR-003**: Authentication, idea submission, and admin review screens MUST provide keyboard-accessible controls, visible focus states, and programmatically associated labels.
- **NFR-004**: Validation errors MUST be presented as inline field-level feedback and a form-level summary when submission fails.
- **NFR-005**: Upload UX MUST provide visible progress or loading feedback and return validation outcomes within 3 seconds for files up to 10MB on a standard local development machine.

### Key Entities

- **User**: Represents a registered employee with a role of submitter or admin; owns submitted ideas and can authenticate.
- **Idea**: Represents an innovation submission that includes title, description, category, attachment metadata, submitter identity, status, and evaluation comments.
- **Attachment**: Represents a single file attached to an idea and includes enough metadata for storage and retrieval.
- **Evaluation Comment**: Represents admin feedback attached to an idea during review.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: A user can register, log in, submit an idea, and log out successfully in a local environment.
- **SC-002**: Submitters can view their own ideas, and admins can view all ideas, in at least 90% of manual local test cases.
- **SC-003**: Admins can update idea status and add evaluation comments for at least 95% of reviewed ideas during acceptance testing.
- **SC-004**: The core submission and review flow is usable locally with no more than 3 manual steps for each role to complete their primary tasks.
- **SC-005**: The app starts and serves locally without build or runtime errors on the intended local development environment.

### Success Criteria Measurement Notes

- **M-001**: Manual test pack size for SC-002 is 10 runs (5 submitter-scope, 5 admin-scope). Passing threshold is at least 9 of 10 successful runs.
- **M-002**: Measurement set for SC-003 is 20 admin review actions sampled in one acceptance test cycle. Passing threshold is at least 19 of 20 actions succeeding.
- **M-003**: SC-004 step count is measured only for primary tasks: submitter create-and-submit idea and admin review-and-update idea. Each primary task must complete in 3 or fewer user actions after authentication.

## Assumptions

- User registration and login are part of the same application rather than delegated to an external identity provider for MVP.
- The app is intended for local development and testing only; production deployment and scaling are out of scope for this MVP.
- New registrations create submitter accounts only; admin accounts are provisioned separately via seeded or manual setup.
- Categories for ideas are a fixed set: Technical Innovation, Process Improvement, Client Solution, and Other.
- File attachments are limited to one per idea, stored locally with metadata in SQLite, capped at 10MB, and restricted to PDF, PNG, JPG, JPEG, or DOCX files.
- Phase 1 attachment access uses public static URLs under `public/uploads`; protected download routing is explicitly out of scope.
- Local environments provide write permissions for `public/uploads` and allow serving static files from that directory.
- UI polish is not required; the primary goal is a working, usable experience for submitters and admins.
