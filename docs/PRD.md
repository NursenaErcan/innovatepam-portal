# InnovatEPAM Portal PRD

## Product Overview
InnovatEPAM Portal is a local MVP web application for employee innovation management. It provides a complete submitter-to-admin workflow: employees register and submit ideas with one attachment, while admins review all ideas, update statuses, and add evaluation comments.

The current product reflects implemented functionality, not planned-only scope. The system is validated for local execution using Next.js, Prisma, and SQLite.

## Problem Statement
Internal innovation ideas are often scattered across email, chats, and spreadsheets. This creates poor visibility into idea lifecycle, inconsistent review quality, limited traceability, and weak ownership.

InnovatEPAM Portal solves this by centralizing intake, review, status tracking, and evaluation feedback in one workflow.

## Goals
- Provide a low-friction idea submission flow for employees.
- Give admins a single review surface for all submissions.
- Enforce role boundaries between submitter and admin actions.
- Maintain local MVP simplicity with predictable setup and run steps.
- Keep delivery traceable through specification-driven development.

## Target Users
- Submitter (employee): registers, signs in, submits ideas, and tracks own submissions.
- Admin (reviewer/manager): signs in with pre-provisioned account, reviews all ideas, updates statuses, and adds comments.

## MVP Scope
The following scope is implemented in the current MVP:

- Authentication and access control:
- Public registration for submitter role only.
- Login and logout using cookie/session authentication.
- Database-backed sessions.
- Route and API guards enforcing submitter/admin permissions.

- Submitter experience:
- Idea creation with required fields: title, description, category, one attachment.
- Attachment validation: exactly one file, max 10MB, allowed types PDF/PNG/JPG/JPEG/DOCX.
- Personal dashboard showing only own ideas and statuses.
- Empty state for users without submissions.

- Admin experience:
- Dashboard listing all submitted ideas with submitter context.
- Status updates across submitted, under_review, accepted, rejected with transition validation.
- Evaluation comment creation per idea.

- Data and storage:
- SQLite via Prisma models: User, Idea, Attachment, EvaluationComment, Session.
- File storage under public/uploads.
- Static attachment URL access for Phase 1.

- Operational readiness:
- Prisma migration and seed workflow working locally.
- Seeded admin account behavior is idempotent.
- Quickstart and API contract aligned with implementation.

## Functional Requirements
- FR-001: Public users can register submitter accounts.
- FR-002: Registered users can login and logout.
- FR-003: The system supports submitter and admin roles.
- FR-004: Submitters can create ideas with title, description, category, and one attachment.
- FR-005: Submitters can view only their own ideas.
- FR-006: Admins can view all ideas.
- FR-007: Admins can update idea status.
- FR-008: Admins can add evaluation comments.
- FR-009: Role-based access separation is enforced across pages and APIs.
- FR-010: Public registration cannot create admin users.
- FR-011: Admin users are provisioned separately (seed/manual setup).
- FR-012: The app runs locally for development and demonstration.
- FR-013: Functional UI exists for auth, submission, and review workflows.
- FR-014: Multiple attachments per idea are rejected.
- FR-015: Validation feedback is shown for required fields and attachment rules.

## Non-Goals
- Production deployment and multi-environment infrastructure.
- Enterprise SSO/OAuth and identity-provider integration.
- Protected, role-aware file download endpoints.
- Real-time notifications, messaging, or collaboration threads.
- Advanced analytics dashboards and exports.
- Multi-tenant organization segmentation.
- Full automated test suite in this MVP phase.
- High-polish UI design work beyond functional usability.

## Success Criteria
- SC-001: A submitter can register, login, submit an idea, and logout locally.
- SC-002: Submitters see only their ideas and admins see all ideas in at least 90% of manual local test cases.
- SC-003: Admin status updates and evaluation comments succeed in at least 95% of sampled review actions.
- SC-004: Primary submitter and admin tasks complete in 3 or fewer user actions after authentication.
- SC-005: The app builds and runs locally without runtime or build failures.

Measurement baseline used in project workflow:
- SC-002 interpreted as at least 9 successful runs out of 10.
- SC-003 interpreted as at least 19 successful actions out of 20.

## Technical Constraints
- Framework: Next.js App Router.
- Language: TypeScript with strict compiler settings.
- Styling: Tailwind CSS.
- ORM/Database: Prisma with SQLite.
- Authentication: cookie/session model with HttpOnly cookie behavior and local-friendly defaults.
- Password hashing: bcrypt.
- File handling: local filesystem under public/uploads.
- Environment: local developer environment only for MVP.
- Dependency policy: minimal and justified additions.
- Testing approach in MVP: manual validation accepted.

## Future Roadmap (Phases 2-7)

### Phase 2: Security Hardening and Auth Maturity
- Centralize route protection with middleware.
- Add CSRF defenses and stronger session rotation strategy.
- Introduce login rate limiting and lockout policy.
- Add admin account lifecycle operations (create/deactivate/reset).

### Phase 3: Attachment Security and File Management
- Replace public static attachment access with protected download endpoints.
- Enforce ownership and role checks for file access.
- Add malware scanning hooks and stronger content validation.
- Define attachment lifecycle policy (replace/remove/version).

### Phase 4: Workflow Depth and Review Governance
- Add richer status flow and reason codes.
- Add reviewer assignment and ownership.
- Add auditable status/comment history views.
- Add bulk admin actions for review efficiency.

### Phase 5: Search, Filtering, and Reporting
- Add full-text search across ideas and comments.
- Add filtering and sorting by category, status, date, and submitter.
- Add dashboard metrics for throughput and acceptance trends.
- Add report export options.

### Phase 6: Collaboration and Notifications
- Add submitter/admin notifications for status and comment changes.
- Add discussion threads and mention-style collaboration.
- Add moderation/escalation workflow options.
- Add notification preference controls.

### Phase 7: Production Readiness and Scale
- Introduce production database profile and migration pipeline.
- Add CI/CD and automated tests (unit, integration, end-to-end).
- Add observability (structured logs, metrics, tracing).
- Add deployment hardening, backup, and recovery posture.
