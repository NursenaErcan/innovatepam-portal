# Quickstart: Phase 5 Multi-Stage Review

## Prerequisites
- Dependencies installed (`npm install`).
- Local SQLite database configured.
- Seeded submitter and admin users available.
- Phase 1–4 functionality verified working on current branch.

## Setup

1. Apply migration and regenerate Prisma client:

```bash
npm run db:migrate -- --name multi-stage-review
npm run db:generate
```

The migration:
- Adds the `ReviewStage` enum.
- Adds `reviewStage` column to `Idea` with a default of `initial_screening`.
- Backfills existing `submitted` and `under_review` ideas to `initial_screening`.
- Sets `reviewStage = null` for all `draft` ideas.
- Creates the `StageComment` table.

2. Start development server:

```bash
npm run dev
```

---

## Manual Validation Scenarios

### US1 checklist: admin advances idea through review stages

- [ ] Submit an idea as a submitter (verify it starts at Initial Screening in admin panel).
- [ ] As admin, open the idea detail and confirm the current stage label is "Initial Screening".
- [ ] Advance the idea to Technical Review and confirm the stage updates to "Technical Review".
- [ ] Advance again to Business Impact Review and confirm stage updates.
- [ ] Advance again to Final Decision and confirm stage updates.
- [ ] Verify no further advance is possible from Final Decision.

### US1 backward movement checklist

- [ ] From Technical Review, move the idea backward to Initial Screening and confirm the stage retreats.
- [ ] From Initial Screening, verify no further backward movement is possible.

### US2 checklist: admin adds stage-specific evaluation comments

- [ ] With idea at Technical Review, add a comment. Confirm comment is saved with stage "technical_review".
- [ ] Advance idea to Business Impact Review. Add another comment. Confirm it is saved with stage "business_impact_review".
- [ ] Open idea detail and confirm both comments appear in chronological order with their stage labels.
- [ ] Confirm comments are NOT lost when the stage is changed.

### US3 checklist: submitter views review stage and feedback

- [ ] As submitter, open an idea that is in Technical Review and confirm the current stage is visible.
- [ ] Confirm stage comments added by admin are visible to the submitter with stage labels and text.
- [ ] Confirm that admin identity (name/email) is NOT shown to the submitter.
- [ ] Open a draft idea as submitter and confirm no review stage information is displayed.

### US4 checklist: final decision sets accepted/rejected

- [ ] Advance an idea to Final Decision. Mark it as Accepted. Confirm status is Accepted.
- [ ] Verify no stage-change controls are available on an Accepted idea.
- [ ] Confirm the Accepted idea does NOT appear in the active admin review queue.
- [ ] Repeat with a Rejected decision and confirm same behavior.

### US5 checklist: draft ideas excluded from review pipeline

- [ ] Save an idea as a draft. Log in as admin. Confirm the draft does NOT appear in any review stage queue.
- [ ] Submit the draft as the submitter. Log in as admin. Confirm the now-submitted idea appears in Initial Screening.

### Backward compatibility checklist (Phase 1–4 regression)

- [ ] Existing submitted ideas (pre-Phase 5) appear in Initial Screening after migration.
- [ ] General evaluation comments (Phase 1) continue to function separately from stage comments.
- [ ] Attachment upload and download (Phase 3) unaffected by Phase 5 changes.
- [ ] Draft save, edit, delete, and final submit (Phase 4) continue to work correctly.
- [ ] Custom fields (Phase 2) continue to display and validate correctly.

---

## SC Measurement Reference

| Success Criteria | How to Verify |
|---|---|
| SC-001: Admin advances through all 4 stages in one session | Complete US1 checklist in one session; confirm all transitions succeed. |
| SC-002: Stage comments visible to submitter without reload | After admin adds comment, switch to submitter session and refresh idea detail. Comment must appear. |
| SC-003: 100% of submitted ideas enter Initial Screening | Check 3+ submitted ideas in DB (`prisma studio` or query) — all should have `reviewStage = initial_screening`. |
| SC-004: 0% of draft ideas in admin review queue | Confirm US5 checklist; no draft surfaces in any admin stage view. |
| SC-005: 0 stage changes succeed on final-state ideas | Attempt API call `PATCH /api/admin/{acceptedIdeaId}/review-stage` — must return 409. |
| SC-006: Phase 1–4 regressions = 0 | Complete Phase 1–4 backward compatibility checklist above. |

---

## Accessibility Validation (Manual)

### ReviewPipeline
- [ ] Can be focused via keyboard tab order (Tab/Shift+Tab cycles through all interactive elements).
- [ ] Advance/retreat controls are operable by keyboard (Enter/Space triggers action) and have visible focus indicators (outline or highlight).
- [ ] Disabled controls remain focusable and provide an accessible tooltip explaining why they are disabled (tooltip is announced by screen readers and visible on focus/hover).
- [ ] All stage labels are announced by screen readers (use aria-label or visually hidden text as needed).

### StageCommentForm
- [ ] All form fields and buttons are reachable and operable by keyboard (Tab/Shift+Tab, Enter/Space).
- [ ] Focus order is logical and matches visual layout.
- [ ] Submit can be triggered by keyboard only (Enter on textarea or button).
- [ ] Error messages and validation feedback are announced by screen readers (aria-live region or similar).
- [ ] Submit button is disabled when input is invalid, but remains focusable and provides an accessible reason (aria-disabled, tooltip, or aria-describedby).

### StageCommentList
- [ ] List items are accessible by keyboard navigation (Tab/Arrow keys as appropriate).
- [ ] Each comment's stage label is announced by screen readers (aria-label or visually hidden text).
- [ ] No information is hidden from assistive technology (all content is accessible via screen reader).

Reference: These checks are required to satisfy constitution §V accessibility requirements and must be verified for all new review-stage UI components.
