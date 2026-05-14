# PROJECT_SUMMARY

## 1. Project Overview
InnovatEPAM Portal is an internal innovation management application for collecting employee ideas and supporting a structured admin review workflow. The project has now progressed through four implemented phases, moving from a core role-based portal, to category-aware smart submission forms, to secure multi-media support with protected attachment handling, and most recently to draft management capabilities enabling submitters to save work-in-progress ideas.

The current application state includes authentication, role-based workflows, dynamic submission structures, multi-file upload support, secure attachment access, draft lifecycle management, and full implementation documentation.

## 2. Completed Phases

### Phase 1 Core Portal
- Registration, login, and logout with database-backed sessions.
- Role-based access for submitter and admin users.
- Idea submission with title, description, category, and attachment support.
- Admin review workflow across all submitted ideas.
- Status updates with server-side transition validation.
- Evaluation comments for admin feedback.

### Phase 2 Smart Submission Forms
- Category-aware dynamic forms in the submitter submission flow.
- JSON-based `customFields` storage on ideas.
- Category-specific validation on both client and server.
- Admin rendering of category-specific fields using readable labels.
- Backward-compatible extension of the original idea model without breaking Phase 1 flows.

### Phase 3 Multi-Media Support
- Multiple attachments per idea submission.
- Relational `Attachment` model with one-to-many attachment support.
- Secure attachment API for protected file access.
- Owner/admin-only attachment access control.
- Image thumbnail previews in admin review surfaces.
- Inline image previews in the browser.
- Forced download support via query-driven behavior.
- Attachment ordering through persisted display order.
- Configurable upload limits.
- Regression validation across prior phases.

### Phase 4 Draft Management
- Submitters can save ideas as drafts without final submission.
- Draft ideas remain fully editable and deletable.
- Drafts are visible only to the owner submitter.
- Drafts are completely hidden from admin review queues.
- Final submission converts draft status to submitted.
- Submitted ideas become read-only for submitters.
- Form reset after successful submission (new or draft save).
- Status-based access control: `draft` vs `submitted` with different UI actions.

## 3. Implementation Details

### Phase 3 Multi-Media Support Architecture
Phase 3 introduced a complete attachment-system upgrade rather than a superficial UI enhancement.

- Multiple attachments can now be associated with a single idea.
- Attachment persistence now uses a relational Prisma-backed model.
- Protected attachment access is provided through a secure API route instead of public-only file links.
- Access is restricted to the idea owner or admins.
- Admins can see image thumbnail previews for supported image MIME types.
- Image previews open inline in the browser when accessed without a forced-download flag.
- Download links force file download using explicit query parameter behavior.
- Attachments preserve user-selected ordering through stored `displayOrder` values.
- Upload validation supports configurable count and size constraints.
- Phase 1 and Phase 2 regression checks remain part of the delivery workflow.

### Phase 4 Draft Management Architecture
Phase 4 introduced submission lifecycle separation enabling submitters to save work-in-progress ideas.

- **Draft Lifecycle**: Ideas are created with `status = "draft"` when "Save as Draft" is clicked, and remain editable until final submission.
- **Status-Based Access**: Draft ideas have `status = "draft"` in the schema enum, allowing fine-grained access control and filtering.
- **API Separation**: PATCH `/api/ideas/[ideaId]` updates existing drafts, POST `/api/ideas/[ideaId]/submit` finalizes drafts, DELETE removes them.
- **Admin Exclusion**: GET `/api/admin/ideas` includes `where: { status: { not: "draft" } }`, ensuring drafts never appear in review queues.
- **Form State Management**: Form resets after new idea creation or draft save, and maintains edit state when modifying drafts.
- **Submitter Dashboard**: Draft cards show "Edit Draft", "Delete Draft", and "Submit Draft" action buttons only for draft status.
- **Read-Only Enforcement**: Submitted ideas (status `submitted`) show no edit/delete buttons and are read-only for submitters.

## 4. Architecture Improvements

### Transition From Single Attachment to Relational Attachment System
The original design stored only one attachment per idea. Phase 3 evolved this into a one-to-many attachment relationship, allowing each idea to hold multiple associated files with stable ordering and metadata. This improved extensibility and aligned the schema with real product needs.

### Secure Route-Based File Access
Earlier attachment handling relied on direct public file paths. The updated design routes attachment access through protected API handlers, enabling enforcement of owner/admin authorization, differentiated preview versus download behavior, and future extensibility for auditing or additional content controls.

### JSON `customFields` Architecture From Phase 2
Phase 2 introduced `customFields` as a JSON-backed structure to support dynamic category-specific submission fields without repeated schema churn. That design remains central in the current architecture and demonstrates how the product evolved additively while keeping the idea model flexible.

### Prisma Schema Evolution Across Phases
The Prisma schema has evolved incrementally across all phases:
- Phase 1 established core entities such as `User`, `Idea`, `Attachment`, `EvaluationComment`, and `Session`.
- Phase 2 extended `Idea` with JSON `customFields`.
- Phase 3 reshaped attachment storage from a single attachment reference into a relational ordered attachment collection.

This evolution preserved continuity while allowing each phase to deepen capability without replacing the entire data model.

## 5. Engineering Challenges

### SQLite Locking During Branch Switching
SQLite-based local development is simple and effective, but branch switching introduced occasional locking and migration friction when schema or generated client state changed between branches. This required careful synchronization of migrations, Prisma client generation, and local database state.

### Attachment Preview vs Download Behavior
Phase 3 exposed a subtle UX and API challenge: image files need to preview inline while explicit download links must force download. Resolving this required both correct API header behavior and correct UI wiring so preview links and download links use different URLs.

### Secure File Authorization
Moving from public file links to secure attachment delivery introduced an authorization challenge. The system had to ensure that only admins and the idea owner could access protected files while still supporting image previews and download workflows cleanly.

### Migration Synchronization Issues
Schema evolution across phases created synchronization concerns between Prisma schema, generated client types, migration SQL, and route/component usage. Mixed old/new code paths could trigger runtime validation errors until all include statements, payload mappings, and relation names were aligned.

### Phase 4: Draft Status Handling and Form State Management
Phase 4 introduced submission mode separation challenges:

**Challenge 1: submissionMode Parameter Not Being Read**
- **Issue**: Form was sending `submissionMode = "draft"` in FormData, but POST handler wasn't extracting it, causing all ideas to default to `submitted` status.
- **Root Cause**: Missing extraction line in POST `/api/ideas` handler.
- **Solution**: Added `const submissionMode = String(formData.get("submissionMode") ?? "final").trim();` to read the parameter, then set `status: submissionMode === "draft" ? "draft" : "submitted"` on creation.
- **Validation**: Added console logging to trace submissionMode through the API to confirm correct status assignment.

**Challenge 2: Admin Visibility of Drafts**
- **Issue**: Draft ideas were appearing in admin review queues despite being intended as private work-in-progress.
- **Root Cause**: GET `/api/admin/ideas` had no filter to exclude drafts.
- **Solution**: Added `where: { status: { not: "draft" } }` to the Prisma query, ensuring only submitted/under_review/accepted/rejected ideas appear to admins.
- **Validation**: Query tested to confirm drafts are completely excluded from admin endpoints.

**Challenge 3: Form Reset and Edit State Coordination**
- **Issue**: Form didn't properly reset after saving new drafts, leaving fields populated for new idea entry.
- **Solution**: Enhanced reset logic to handle three scenarios: final submission (reset + clear), new draft save (reset for new entry), and draft edit (keep edit mode with save confirmation message).

**Challenge 4: Button Handler Type Confusion**
- **Issue**: "Save as Draft" button needed to explicitly call draft handler, not default form submission.
- **Solution**: Button uses `type="button"` with `onClick={() => void handleAction("draft")}` to bypass form onSubmit handler.
- **Validation**: Form submission mode correctly routed to appropriate API endpoints.

## 6. AI Collaboration
SpecKit and GitHub Copilot were used iteratively across multiple phases rather than as one-time scaffolding tools.

- SpecKit provided the structured workflow: specification, clarification, planning, task generation, analysis, and implementation.
- Copilot accelerated implementation, debugging, route refactors, schema alignment, build validation, and documentation updates.
- The combination supported an iterative delivery loop where each phase could be clarified, planned, implemented, and re-validated with explicit traceability.
- Across multiple phases, this workflow helped reduce requirement drift, expose inconsistencies early, and keep architecture evolution understandable.

## 9. Final Current Status
InnovatEPAM Portal now includes:

- Authentication with session-based login.
- Role-based access control (submitter, admin).
- Dynamic submission forms with category-specific fields.
- Multi-file uploads with secure attachment handling.
- Admin review workflow with status transitions and evaluation comments.
- **Draft management**: Save, edit, delete, and submit ideas as drafts with private visibility.
- Form state management with proper reset behavior after successful submissions.

### Completed Deliverables
✅ Phase 1: Core Portal (authentication, roles, submissions, admin review)  
✅ Phase 2: Smart Submission Forms (category-aware dynamic fields)  
✅ Phase 3: Multi-Media Support (attachments, previews, secure downloads)  
✅ Phase 4: Draft Management (save/edit/delete/submit drafts with privacy)

## 10. Future Roadmap

### Phase 5: Multi-Stage Review
- Multiple review stages: Initial Review → Technical Evaluation → Leadership Approval
- Stage-specific reviewer assignments and permissions
- Automatic routing between stages based on approval status
- Timeline tracking for each review stage

### Phase 6: Blind Review
- Anonymized submitter information during technical evaluation
- Configurable anonymization rules per review stage
- Submission metadata visibility (category, attachments) without submitter identity
- De-anonymization after final approval

### Phase 7: Scoring System
- Scoring rubrics with weighted criteria per review stage
- Numerical scoring input with validation and constraints
- Aggregate scoring across multiple reviewers
- Scoring summary dashboard for submitters and admins

## 7. Technical Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- bcrypt
- SpecKit
- GitHub Copilot

## 8. Spec-Driven Delivery Workflow
The project followed a structured specification-driven delivery flow across phases:

- Constitution established engineering principles and delivery constraints.
- Specifications captured each feature phase in business terms.
- Clarification resolved ambiguous requirements before implementation.
- Planning generated technical design artifacts.
- Task generation created dependency-ordered implementation work.
- Analysis surfaced gaps and consistency issues.
- Implementation executed tasks with validation and documentation updates.

This process made multi-phase evolution manageable and auditable.

## 10. Updated Future Roadmap
Remaining phases are:

- Phase 4 Draft Management
- Phase 5 Multi-Stage Review
- Phase 6 Blind Review
- Phase 7 Scoring System

These phases build on the current foundation of authenticated workflows, dynamic submission models, secure file handling, and admin review capabilities.

## 11. Final Outcome
The current state of InnovatEPAM Portal is a fully documented multi-phase application that has progressed beyond a simple MVP. It now combines role-aware workflows, extensible idea data structures, secure relational attachments, and specification-driven engineering practices into a coherent local product suitable for continued phased expansion.

