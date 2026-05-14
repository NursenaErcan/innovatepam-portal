# Feature Specification: Blind Review

**Feature Branch**: `006-blind-review`

**Created**: 2026-05-14

**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin reviews idea without seeing submitter identity (Priority: P1)

An admin opens an idea that is currently at Initial Screening, Technical Review, or Business Impact Review. The admin can read the idea title, description, category, attachments, custom fields, stage comments, and the current stage — but the submitter's name and email are not shown anywhere on the review surface.

**Why this priority**: This is the core privacy guarantee of blind review. Without it, no other feature in this phase has value.

**Independent Test**: Submit an idea as a submitter, move it to Technical Review as admin, open the idea in the admin panel — confirm no submitter identity appears.

**Acceptance Scenarios**:

1. **Given** an idea is at Initial Screening, **When** an admin views the idea in the admin review panel, **Then** no submitter name or email is shown.
2. **Given** an idea is at Technical Review, **When** an admin views the idea, **Then** submitter identity is hidden.
3. **Given** an idea is at Business Impact Review, **When** an admin views the idea, **Then** submitter identity is hidden.
4. **Given** an idea that is at Final Decision, **When** an admin views the idea, **Then** submitter name and email ARE visible.
5. **Given** an idea with status Accepted or Rejected, **When** an admin views it, **Then** submitter identity IS visible (resolved, not under blind stages).

---

### User Story 2 — Submitter always sees their own ideas normally (Priority: P1)

A submitter navigates to the submitter dashboard. All their ideas are displayed with full detail. Blind review applies only to the admin-facing review surface and does not affect the submitter's own view of their ideas.

**Why this priority**: Blind review must not accidentally degrade the submitter experience or break existing Phase 1–5 functionality.

**Independent Test**: Log in as a submitter and view your ideas — submitter identity section is irrelevant from their own view and all existing fields render correctly.

**Acceptance Scenarios**:

1. **Given** a submitter is logged in, **When** they view their ideas on the submitter dashboard, **Then** all idea content including stage comments is shown normally.
2. **Given** an idea is under blind review stages, **When** the submitter views it, **Then** submitter-facing rendering is unchanged from Phase 5 behavior.

---

### User Story 3 — StageComment workflow continues unchanged under blind review (Priority: P1)

Admins can add stage comments to ideas at any review stage, including blind stages. Stage comments are saved and displayed normally. The only change is that submitter identity is hidden from the panel header/context; comment authoring and history are unaffected.

**Why this priority**: Breaking stage comments would regress Phase 5 functionality.

**Independent Test**: Add a stage comment to an idea at Technical Review — comment is saved with the correct stage, appears in the comment list, and submitter identity is still not shown in the card header.

**Acceptance Scenarios**:

1. **Given** an idea at Technical Review, **When** an admin adds a stage comment, **Then** the comment is saved with stage context and appears in the stage comment list.
2. **Given** blind review is active, **When** stage comment history is rendered, **Then** the comment list displays normally for both admin (showAdmin=true) and submitter (showAdmin=false) views.

---

### User Story 4 — Stage transitions continue working under blind review (Priority: P2)

Admins can advance or retreat ideas through review stages while blind review is active. Previous/Next controls remain functional. Final Decision advancement exposes submitter identity as the idea exits the blind review window.

**Why this priority**: Stage navigation is core Phase 5 behavior and must not regress.

**Independent Test**: Advance an idea from Technical Review to Business Impact Review — transition succeeds and the card still hides submitter identity. Advance to Final Decision — submitter identity becomes visible.

**Acceptance Scenarios**:

1. **Given** an idea at Technical Review, **When** an admin advances to Business Impact Review, **Then** transition succeeds and submitter identity remains hidden.
2. **Given** an idea at Business Impact Review, **When** an admin advances to Final Decision, **Then** transition succeeds and submitter identity becomes visible.
3. **Given** an idea at Final Decision, **When** an admin retreats to Business Impact Review, **Then** transition succeeds and submitter identity is hidden again.

---

### User Story 5 — Accepted/Rejected outcomes are unchanged (Priority: P2)

The Final Decision accept/reject workflow introduced in Phase 5 continues to work exactly as before. Blind review does not block or alter the decision gateway.

**Why this priority**: Preserves Phase 5 investment and ensures end-to-end idea resolution still works.

**Independent Test**: Advance an idea to Final Decision, accept it — status changes to Accepted, submitter identity is visible, idea moves to resolved queue.

**Acceptance Scenarios**:

1. **Given** an idea at Final Decision, **When** admin accepts it, **Then** status becomes Accepted, idea moves to resolved, submitter identity is shown.
2. **Given** an idea at Final Decision, **When** admin rejects it, **Then** status becomes Rejected, idea moves to resolved, submitter identity is shown.

---

### Edge Cases

- What happens when an idea has no submitter record? System must not crash; render gracefully without identity field.
- What if an idea is directly created at Final Decision stage (e.g., migrated)? Submitter identity must be visible immediately.
- What if admin has a browser extension that injects text? Blind review operates server-side by withholding identity from the response/render; client-side extensions are out of scope.
- What happens during a stage retreat from Final Decision back into a blind stage? Submitter identity must be hidden again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin review panel MUST hide submitter name and email when an idea is at Initial Screening, Technical Review, or Business Impact Review.
- **FR-002**: The admin review panel MUST show submitter name and email when an idea is at Final Decision, Accepted, or Rejected.
- **FR-003**: Blind review MUST apply only to admin review interfaces; submitter-facing views MUST be unaffected.
- **FR-004**: Stage transitions (advance, retreat) MUST continue to function normally regardless of blind review state.
- **FR-005**: Stage comments (create, list) MUST continue to function normally under blind review.
- **FR-006**: The accept/reject Final Decision workflow MUST remain unchanged.
- **FR-007**: No new API endpoints are required; identity hiding MUST be implemented at the rendering layer.
- **FR-008**: Phase 1–5 regression behaviors MUST be preserved.

### Key Entities

- **Idea**: Existing entity. Key attribute for blind review: `reviewStage` determines whether submitter identity is hidden in admin view.
- **Submitter (User)**: Identity (name/email) is conditionally rendered based on idea's current review stage in admin surfaces.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For 100% of ideas at Initial Screening, Technical Review, or Business Impact Review, no submitter identity appears in the admin panel.
- **SC-002**: For 100% of ideas at Final Decision, Accepted, or Rejected, submitter identity is visible in the admin panel.
- **SC-003**: Stage comment creation and display success rate is 100% — no regression from Phase 5 StageComment behavior.
- **SC-004**: Stage transition success rate is 100% — advancing and retreating through all four stages succeeds without errors.
- **SC-005**: Zero regressions in Phase 1–5 submitter flows — submitters see their own idea data normally.
- **SC-006**: Blind review toggle (hide/show) is instantaneous — no extra round-trip required beyond the existing page load.

## Assumptions

- Blind review is determined solely by the idea's current `reviewStage` value at render time — no separate feature-flag configuration is required.
- The implementation is a pure rendering-layer concern: the admin panel component conditionally shows the submitter field based on `reviewStage`.
- No database schema changes are required for Phase 6; the existing `reviewStage` field is sufficient.
- "Submitter identity" means the submitter email (and display name if any) — not idea content such as title, description, or category.
- Admin identity in stage comments (`showAdmin=true`) is unaffected — this refers to who left the comment, not the idea submitter.
- The `draft` status is excluded from the admin queue already (Phase 4); drafts are not a blind review concern.
- Accessibility requirements from Phase 5 (keyboard navigation, visible focus) carry forward unchanged.
