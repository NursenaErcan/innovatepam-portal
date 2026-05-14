# Feature Specification: Phase 3 Multi-Media Support

**Feature Branch**: `003-smart-submission-forms`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Add Phase 3 Multi-Media Support to InnovatEPAM Portal.

Requirements:
- Ideas can contain multiple attachments
- Users can upload multiple files during submission
- Users can remove attachments before submission
- Admins can view and download all attachments
- Image attachments should show simple thumbnail previews
- Existing allowed file types remain:
  - PDF
  - PNG
  - JPG
  - JPEG
  - DOCX
- Existing upload validation rules remain
- Existing Phase 1 and Phase 2 functionality must continue working"

## Clarifications

### Session 2026-05-14

- Q: What should be the maximum attachment count per idea? -> A: Configurable cap, default 10 attachments per idea.
- Q: Who can download attachments? -> A: Only the idea owner submitter and admins can download attachments.
- Q: When should files be uploaded in the submit flow? -> A: Upload all files only when user clicks final submit.
- Q: What should happen if one attachment save fails during final submit? -> A: Atomic behavior; submission fails and nothing is persisted.
- Q: Are attachments required for submission? -> A: Attachments are optional; users may submit with zero attachments.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Multiple Files With Control (Priority: P1)

As a submitter, I can attach multiple files to one idea during submission and remove any file before final submit so that I can send complete supporting materials without mistakes.

**Why this priority**: Submission is the core value path. Without multi-file submission and pre-submit removal, Phase 3 does not deliver user value.

**Independent Test**: Can be fully tested by signing in as a submitter, starting a new idea, selecting multiple valid files, removing one before submit, and verifying only remaining files are persisted with the idea.

**Acceptance Scenarios**:

1. **Given** a submitter is creating an idea, **When** they select multiple valid attachments, **Then** all selected attachments are listed before submission.
2. **Given** a submitter has selected multiple attachments, **When** they remove one before submitting, **Then** the removed file is excluded from the final submission.
3. **Given** a submitter submits with multiple valid attachments, **When** submission succeeds, **Then** the idea is stored with all remaining selected attachments and existing Phase 2 dynamic fields behavior still works.

---

### User Story 2 - Review and Access All Attachments (Priority: P1)

As an admin, I can view all files attached to an idea and download each one so that I can evaluate submissions with complete evidence.

**Why this priority**: Admin decision quality depends on attachment access; inability to access all files blocks practical review.

**Independent Test**: Can be tested by opening admin idea details for a submission with multiple attachments and verifying every file is visible and downloadable.

**Acceptance Scenarios**:

1. **Given** an idea contains multiple attachments, **When** an admin opens that idea, **Then** all attachments are displayed in the admin view.
2. **Given** an admin sees the attachment list, **When** they select a file download link, **Then** the correct file is downloaded.

---

### User Story 3 - Image Preview for Faster Review (Priority: P2)

As an admin, I can see simple thumbnail previews for image attachments so that I can quickly scan visual material without downloading each file.

**Why this priority**: This improves review speed and usability but is not strictly required for basic submission or access.

**Independent Test**: Can be tested by submitting PNG/JPG/JPEG attachments and confirming thumbnail previews appear for image files while non-image files remain listed without thumbnails.

**Acceptance Scenarios**:

1. **Given** an idea includes PNG/JPG/JPEG files, **When** an admin views the idea, **Then** each image file shows a simple thumbnail preview.
2. **Given** an idea includes PDF or DOCX files, **When** an admin views the idea, **Then** non-image files display as downloadable items without image previews.

---

### Edge Cases

- What happens when a submitter uploads a mix of valid and invalid file types in the same attempt?
- How does the system behave when one file in a multi-file upload exceeds the existing max file size rule?
- What happens when a submitter removes all selected files before submit?
- How are older Phase 1 ideas with a single attachment displayed alongside newer ideas with multiple attachments?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a single idea submission to include multiple attachments.
- **FR-002**: System MUST allow submitters to select multiple files in one submission interaction.
- **FR-003**: System MUST allow submitters to remove selected attachments before final submission.
- **FR-004**: System MUST preserve current allowed file types for attachments: PDF, PNG, JPG, JPEG, and DOCX.
- **FR-005**: System MUST preserve existing upload validation rules for each attachment (including maximum file size and file-type validation).
- **FR-006**: System MUST reject submission when any included attachment violates existing validation rules and return clear field-level error feedback.
- **FR-007**: System MUST persist all valid attachments associated with an idea in submission order.
- **FR-008**: Admin users MUST be able to view all attachments linked to an idea.
- **FR-009**: Admin users MUST be able to download each attachment linked to an idea.
- **FR-010**: System MUST render simple thumbnail previews for image attachments (PNG, JPG, JPEG) in admin idea details.
- **FR-011**: System MUST continue to display non-image attachments as standard downloadable files without thumbnail previews.
- **FR-012**: Existing Phase 1 and Phase 2 workflows MUST remain functional without behavioral regression.
- **FR-013**: Existing ideas created before Phase 3 MUST remain readable and reviewable without migration errors.
- **FR-014**: System MUST enforce a configurable maximum number of attachments per idea, with a default of 10, and return clear validation feedback when the limit is exceeded.
- **FR-015**: System MUST allow attachment download access only to admin users and the submitter who owns the idea.
- **FR-016**: System MUST upload and persist attachments only during final idea submission, not at file-selection time.
- **FR-017**: System MUST treat final submission with attachments as atomic: if any attachment persistence fails, the idea and all attachments MUST NOT be persisted.
- **FR-018**: System MUST allow idea submission with zero attachments.

### Key Entities *(include if feature involves data)*

- **Idea**: Existing submission record that now references one-to-many attachments while retaining core fields and Phase 2 custom fields.
- **Attachment**: File metadata record tied to an idea, including name, type, size, storage location, and preview eligibility.
- **AttachmentPreview**: View-model concept indicating whether an attachment can be rendered as a simple thumbnail based on file type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid multi-attachment submissions store all selected files and are visible in submitter and admin views.
- **SC-002**: 100% of invalid uploads (wrong type or oversize) are blocked before persistence with clear user-facing validation feedback.
- **SC-003**: Admins can download any attachment for reviewed ideas in under 10 seconds for 95% of attempts in local/manual validation.
- **SC-004**: For ideas containing image attachments, admins can view thumbnail previews for 95% of supported image files without requiring download.
- **SC-005**: Existing Phase 1 and Phase 2 critical flows (auth, dynamic forms, status updates, comments) remain fully executable in regression checks.

## Assumptions

- Existing attachment storage location and access pattern remain unchanged for this phase.
- Existing allowed file types and size constraints apply per attachment in multi-file submissions.
- Maximum number of attachments per idea is configurable and defaults to 10.
- Existing role model (submitter/admin) remains unchanged.
- Attachment download access is restricted to admins and the idea owner submitter.
- Attachment files are transferred and stored only at final submit.
- Final submission uses atomic persistence for idea and attachments.
- Attachments are optional for final submission.
- Thumbnail preview scope is limited to simple image rendering in admin idea details and does not include advanced editing or gallery features.
