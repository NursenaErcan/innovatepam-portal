# Tasks: InnovatEPAM Portal

**Input**: Design documents from `/specs/001-innovation-management/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and baseline structure for the MVP.

- [ ] T001 Update `package.json` to add `prisma`, `@prisma/client`, and `bcrypt` dependencies.
- [ ] T002 Install project dependencies in the repository root using `npm install`.
- [ ] T003 [P] Create `prisma/schema.prisma` and define models for `User`, `Idea`, `Attachment`, `EvaluationComment`, and `Session`.
- [ ] T004 [P] Create `lib/prisma.ts` to initialize the Prisma client.
- [ ] T005 [P] Create `lib/db.ts` for SQLite database connection settings and migration configuration.
- [ ] T006 Create `README.md` or `specs/001-innovation-management/quickstart.md` instructions for local setup and seeded admin provisioning.
- [ ] T007 Create `public/uploads/` directory for local file attachments.
- [ ] T008 Create `prisma/seed.ts` to seed one admin user: `admin@innovatepam.local` / `Admin123!` with role `admin`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication, authorization, session handling, and shared API utilities that all stories depend on.

- [ ] T009 Create `lib/auth.ts` to implement cookie/session authentication, session creation, verification, and logout.
- [ ] T010 Create `lib/validation.ts` for registration, login, idea submission, and status update validation.
- [ ] T011 Create `app/api/auth/register/route.ts` to register submitter users, hash passwords with bcrypt, and initialize submitter role only.
- [ ] T012 Create `app/api/auth/login/route.ts` to verify credentials, create a session token, and set an HttpOnly cookie.
- [ ] T013 Create `app/api/auth/logout/route.ts` to clear the session cookie and remove server-side session records.
- [ ] T014 Create `app/api/ideas/route.ts` to accept idea creation for authenticated submitters, persist idea metadata, store attachment file info, and reject multiple attachments.
- [ ] T015 Create shared route guard helpers in `lib/auth.ts` to enforce `submitter` and `admin` access for API routes.
- [ ] T016 Create `app/api/admin/ideas/route.ts` to return all ideas with submitter and attachment metadata for authenticated admins.
- [ ] T017 Create `app/api/admin/[ideaId]/status/route.ts` to update idea status and validate allowed status transitions for admins.
- [ ] T018 Create `app/api/admin/[ideaId]/comments/route.ts` to add evaluation comments for admins.
- [ ] T019 Document static upload access rules and ensure `public/uploads` is used for local file storage with public static URLs; protected download routing is out of scope for Phase 1.

---

## Phase 3: User Story 1 - Submit idea as a submitter (Priority: P1) 🎯 MVP

**Goal**: Submitters can register, log in, submit a single attachment idea, and view their submitted ideas.

**Independent Test**: Register as a submitter, sign in, submit an idea with a category and file attachment, then verify the idea appears in the submitter idea list.

- [ ] T020 [US1] Create `app/register/page.tsx` with registration form using Tailwind CSS and shadcn/ui input components.
- [ ] T021 [US1] Create `app/login/page.tsx` with login form and client-side validation.
- [ ] T022 [US1] Create `app/submitter/page.tsx` or `app/submitter/ideas/page.tsx` with a submission form for title, description, category, and file upload.
- [ ] T023 [US1] Create `app/components/idea-form.tsx` for the submitter idea creation flow and attach the upload field.
- [ ] T024 [US1] Create `app/components/idea-card.tsx` to display submitted idea details for the submitter view.
- [ ] T025 [US1] Create `app/submitter/ideas/page.tsx` to fetch and render only the authenticated submitter's ideas.
- [ ] T026 [US1] Create `app/page.tsx` or `app/submitter/page.tsx` redirect logic to route authenticated submitters to their idea dashboard.
- [ ] T027 [US1] Add form validation and attachment rules in `lib/validation.ts` to enforce exactly one attachment and required fields.

---

## Phase 4: User Story 2 - Review ideas as an admin (Priority: P2)

**Goal**: Admins can review all submitted ideas, update idea status, and add evaluation comments.

**Independent Test**: Log in as an admin, open the admin dashboard, update an idea status, add a comment, and verify the changes.

- [ ] T028 [US2] Create `app/admin/page.tsx` with admin dashboard navigation.
- [ ] T029 [US2] Create `app/admin/ideas/page.tsx` to fetch and render all submitted ideas for admins.
- [ ] T030 [US2] Create `app/components/status-badge.tsx` to display idea status visually in admin and submitter views.
- [ ] T031 [US2] Create admin controls in `app/admin/ideas/page.tsx` for status updates and comment submission.
- [ ] T032 [US2] Create the admin comment input UI and connect it to `app/api/admin/[ideaId]/comments/route.ts`.
- [ ] T033 [US2] Add server-side admin validation in `lib/auth.ts` for admin-only API routes.
- [ ] T034 [US2] Create `app/admin/ideas/page.tsx` to show submitter identity and uploaded attachment metadata for each idea.

---

## Phase 5: User Story 3 - Local app usability and access control (Priority: P3)

**Goal**: Ensure the app runs locally, secure routes are blocked for unauthenticated users, and role-based navigation is enforced.

**Independent Test**: Start the app locally, verify submitter cannot access admin pages, log out, and verify admin access is restricted to seeded admin users.

- [ ] T035 [US3] Update `app/layout.tsx` or `app/page.tsx` to read session state and show login/register or role-specific navigation.
- [ ] T036 [US3] Create `app/components/auth-form.tsx` or shared auth components for login and registration.
- [ ] T037 [US3] Add route protection in `app/submitter/ideas/page.tsx` and `app/admin/ideas/page.tsx` to redirect unauthorized access.
- [ ] T038 [US3] Document seeded admin setup in `specs/001-innovation-management/quickstart.md` and/or `README.md`.
- [ ] T039 [US3] Add logout link or button to clear session and redirect to the public landing page.
- [ ] T040 [US3] Create a local-friendly empty state for submitters with no ideas in `app/submitter/ideas/page.tsx`.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Shared improvements, formatting, and manual validation across all user stories.

- [ ] T041 [P] Refine `app/globals.css` and Tailwind configuration for consistent spacing and responsive layout.
- [ ] T042 [P] Ensure `app/components/idea-card.tsx` and all forms use accessible labels, keyboard focus, and visible error feedback.
- [ ] T043 [P] Document local run instructions and admin provisioning in `specs/001-innovation-management/quickstart.md`.
- [ ] T044 [P] Verify `public/uploads` is writeable locally and file metadata is persisted correctly in SQLite.
- [ ] T045 [P] Validate that submitter registration creates only submitter accounts and that admin accounts are separated.
- [ ] T046 [P] Clean up any temporary or placeholder UI in `app/page.tsx`, `app/login/page.tsx`, and `app/register/page.tsx`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; begins immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Stories (Phase 3+)**: Depend on Foundational completion; can proceed in parallel once core auth and data access are ready.
- **Polish (Final Phase)**: Depends on completion of all user stories and manual validation.

### User Story Dependencies

- **User Story 1 (P1)**: Must follow Setup and Foundational phases; no dependency on User Story 2.
- **User Story 2 (P2)**: Must follow Setup and Foundational phases; should work independently of User Story 1 once core models exist.
- **User Story 3 (P3)**: Depends on foundational auth/session infrastructure and supports both submitter and admin flows.

### Within Each User Story

- Implement auth and session support before UI navigation.
- Build server API routes before connecting them to pages.
- Implement submitter UI before admin review UI in the MVP sequence.

## Parallel Execution Examples

- Run `T009`, `T010`, `T011`, and `T012` in parallel for authentication and session infrastructure.
- Run `T020`, `T021`, and `T022` in parallel after shared auth is available to build the submitter UI.
- Run `T028`, `T029`, and `T031` in parallel once admin route protection is implemented.
- Run polish tasks `T041` through `T046` after core functionality is complete.

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational auth, database models, and shared API infrastructure.
3. Complete Phase 3: Submitter story end-to-end.
4. Validate the submitter workflow manually.
5. Complete Phase 4: Admin review story.
6. Complete Phase 5: Local access control and usability.
7. Finish with Polish & Cross-Cutting Concerns.
