# Feature Specification: Smart Submission Forms

**Feature Branch**: `[002-smart-submission-forms]`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "Add Phase 2 Smart Submission Forms to InnovatEPAM Portal.

Requirements:
- Submission form dynamically changes based on selected category
- Each category has additional custom fields
- Technical Innovation category should include architecture impact, technology stack, implementation complexity
- Process Improvement category should include current process, proposed improvement, estimated time savings
- Client Solution category should include client problem, business impact, target industry
- Dynamic fields should validate correctly
- Existing Phase 1 functionality must continue working"

## Clarifications

### Session 2026-05-14

- Q: How should category-specific fields be persisted for Phase 2? → A: Store category-specific fields in one structured `customFields` object associated with each idea.
- Q: Should admins see category-specific fields in Phase 2? → A: Yes, admins should see category-specific fields rendered with category-aware labels in idea details.
- Q: How should `estimated time savings` be represented for Process Improvement? → A: As a positive integer number of hours.
- Q: How should `implementation complexity` be represented for Technical Innovation? → A: As an enum with values `low`, `medium`, `high`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Category-Driven Form Inputs (Priority: P1)

A submitter can select a category and immediately see additional category-specific fields required for that category before submitting an idea.

**Why this priority**: This is the core value of Phase 2 and directly improves submission quality and context for reviewers.

**Independent Test**: Sign in as a submitter, open the submission form, switch among categories, and verify the correct category-specific fields appear for each category.

**Acceptance Scenarios**:

1. **Given** a signed-in submitter on the idea submission page, **When** they select "Technical Innovation", **Then** the form shows architecture impact, technology stack, and implementation complexity fields.
2. **Given** a signed-in submitter on the idea submission page, **When** they select "Process Improvement", **Then** the form shows current process, proposed improvement, and estimated time savings fields.
3. **Given** a signed-in submitter on the idea submission page, **When** they select "Client Solution", **Then** the form shows client problem, business impact, and target industry fields.
4. **Given** a signed-in submitter on the idea submission page, **When** they change category, **Then** the dynamic field set updates to match the selected category.

---

### User Story 2 - Dynamic Field Validation and Submission Integrity (Priority: P1)

A submitter receives clear validation feedback for category-specific fields, and the system accepts submission only when all required core and dynamic fields are valid.

**Why this priority**: Without reliable validation, dynamic form behavior can produce incomplete or inconsistent submissions.

**Independent Test**: Submit ideas with missing or invalid category-specific values and confirm errors are shown; then submit with valid values and confirm success.

**Acceptance Scenarios**:

1. **Given** a submitter selected a category, **When** they submit without required category-specific inputs, **Then** the form blocks submission and shows clear validation messages.
2. **Given** a submitter selected a category, **When** they provide valid core and category-specific values, **Then** the idea submission succeeds.
3. **Given** a submitter corrected invalid dynamic inputs, **When** they submit again, **Then** the system accepts the submission without requiring unnecessary re-entry of unchanged valid data.

---

### User Story 3 - Backward-Compatible Phase 1 Workflow (Priority: P2)

The enhanced dynamic form behavior does not break existing Phase 1 functionality for registration, login/logout, attachments, submitter idea list, and admin review.

**Why this priority**: Phase 2 must extend the product without regression in existing proven workflows.

**Independent Test**: Run the core Phase 1 workflow end-to-end after enabling smart forms and verify all prior behaviors still function.

**Acceptance Scenarios**:

1. **Given** the Phase 2 update is active, **When** submitters use registration, login, idea submission with attachment, and idea listing, **Then** all existing Phase 1 behaviors continue to function.
2. **Given** ideas submitted through the enhanced form, **When** admins review ideas, update status, and add comments, **Then** admin review workflows continue to function without loss of core data visibility.
3. **Given** an admin opens an idea submitted with category-specific fields, **When** idea details are displayed, **Then** the dynamic fields appear with category-aware labels.

---

### Edge Cases

- What happens when a submitter changes category after entering category-specific values for a previous category? The form should only enforce currently selected category fields and prevent stale, irrelevant values from being submitted as active category data.
- What happens when a dynamic numeric-style field (such as estimated time savings) is entered in an invalid format? The form should show a clear validation error and block submission.
- What happens when estimated time savings is zero, negative, or non-integer? The form should reject the value and require a positive integer number of hours.
- What happens when implementation complexity contains an unsupported value? The form should reject submission and require one of: low, medium, high.
- What happens when dynamic fields are valid but attachment requirements fail? The system should still block submission and show attachment-specific validation feedback.
- How does the form behave for categories without custom fields (for example, "Other")? The submission should still work using core fields and existing attachment rules.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST dynamically display category-specific fields based on the selected submission category.
- **FR-002**: System MUST provide Technical Innovation fields: architecture impact, technology stack, and implementation complexity.
- **FR-003**: System MUST provide Process Improvement fields: current process, proposed improvement, and estimated time savings.
- **FR-004**: System MUST provide Client Solution fields: client problem, business impact, and target industry.
- **FR-005**: System MUST apply required-field validation to category-specific fields for the selected category.
- **FR-006**: System MUST prevent submission when selected-category dynamic fields are missing or invalid.
- **FR-007**: System MUST provide clear, field-level validation feedback for dynamic field errors.
- **FR-008**: System MUST preserve existing Phase 1 core field and attachment validation behavior.
- **FR-009**: System MUST preserve existing authentication and role-based access behavior from Phase 1.
- **FR-010**: System MUST keep submitter and admin dashboards operational for ideas submitted with dynamic category fields.
- **FR-011**: System MUST ensure category changes update active validation rules to match the currently selected category.
- **FR-012**: System MUST support successful submission for categories that do not define additional custom fields.
- **FR-013**: System MUST persist and retrieve category-specific values using a single structured `customFields` object associated with each idea submission.
- **FR-014**: System MUST render category-specific fields in admin idea details using category-aware labels instead of raw key names.
- **FR-015**: System MUST validate `estimated time savings` as a positive integer number of hours for Process Improvement submissions.
- **FR-016**: System MUST validate `implementation complexity` as one of `low`, `medium`, or `high` for Technical Innovation submissions.

### Key Entities *(include if feature involves data)*

- **Idea Submission**: Represents an innovation idea with core fields (title, description, category, attachment) plus category-specific details stored in a structured `customFields` object tied to the selected category.
- **Category Field Set**: Represents the required dynamic fields associated with each category and their validation expectations.
- **Validation Feedback**: Represents user-visible error state for both core fields and category-specific fields during submission.
- **Admin Idea Details**: Represents the review presentation of core and category-specific data for admins, including labeled dynamic field rendering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tested category selections display the correct dynamic field set for Technical Innovation, Process Improvement, and Client Solution.
- **SC-002**: At least 95% of manual validation test cases correctly block invalid submissions and surface actionable field-level feedback.
- **SC-003**: At least 95% of manual valid-submission test cases complete successfully with dynamic fields included.
- **SC-004**: Existing Phase 1 end-to-end workflow (submitter and admin paths) continues to pass in at least 90% of regression test runs after Phase 2 changes.

## Assumptions

- Existing Phase 1 user roles, authentication, and review workflow remain unchanged.
- Existing idea categories remain available, including Technical Innovation, Process Improvement, Client Solution, and Other.
- Dynamic fields are required only for categories that define custom fields; categories without custom fields continue using core submission fields.
- Phase 2 focuses on dynamic field behavior and validation, not on redesigning existing admin decision workflow.
