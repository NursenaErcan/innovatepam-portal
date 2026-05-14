# Quickstart: Phase 4 Draft Management

## Prerequisites
- Dependencies installed (`npm install`).
- Local SQLite database configured.
- Seeded submitter and admin users available.

## Setup

1. Apply migration and regenerate Prisma client:

```bash
npm run db:migrate -- --name draft-management
npm run db:generate
```

2. Start development server:

```bash
npm run dev
```

## Manual Validation Scenarios

### US1 checklist: save, resume, and update drafts
- [ ] Save a new draft with partial content from submitter form.
- [ ] Reopen draft via Edit draft action and verify fields are prefilled.
- [ ] Save the same draft again and verify no duplicate idea is created.

### US2 checklist: owner privacy, admin exclusion, and delete
- [ ] Verify draft is visible to owner submitter in submitter dashboard.
- [ ] Verify non-owner cannot read/update/delete draft through API paths.
- [ ] Verify admin list endpoint excludes all `draft` status ideas.
- [ ] Delete a draft and verify it no longer appears in submitter dashboard.

### US3 checklist: final submission and read-only behavior
- [ ] Submit valid draft and verify status transitions to `submitted`.
- [ ] Verify submitted idea appears in admin queue and supports existing review flow.
- [ ] Verify submitter cannot edit/delete submitted idea through UI/API.

### SC-003 latency measurement (reopen-to-edit)

Record at least 5 attempts and confirm >=95% complete in under 30 seconds.

| Attempt | Reopen Start (time) | Form Ready (time) | Duration (s) | Under 30s |
|---------|----------------------|-------------------|--------------|-----------|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |

### Submitter draft save and resume
- Login as submitter.
- Start a new idea and enter partial data.
- Save as draft.
- Refresh/reopen submitter ideas page.
- Verify draft is visible and editable with previously saved values.

### Draft update and no duplicate records
- Open an existing draft.
- Change title/description/custom fields and save draft again.
- Verify only one draft record exists for that idea ID and data is updated in place.

### Draft privacy
- As owner submitter, confirm draft appears in personal dashboard.
- As different submitter (or unauthenticated user), attempt to access draft through UI/API and verify denied.

### Admin queue exclusion
- Login as admin.
- Open admin ideas list.
- Verify draft ideas are not included.

### Draft deletion
- As owner submitter, delete a draft.
- Verify it disappears from draft list and cannot be reopened.

### Final submission from draft
- Open a valid draft and submit.
- Verify status transitions to submitted and idea appears in admin queue.
- Verify submitter can no longer edit/delete that idea.

### Submission failure keeps editable draft
- Attempt final submit with missing required fields.
- Verify validation error is shown.
- Verify draft remains saved and editable.

### Regression checks (Phase 1-3)
- Auth flow: register/login/logout still works.
- Phase 2 category-specific field validation still works on final submit.
- Phase 3 multi-attachment behavior still works when saving and submitting draft ideas.
- Admin status updates/comments still work for submitted ideas.

## Suggested Validation Commands

```bash
npm run lint
npm run build
```

## Validation Results (2026-05-14)
- `npm run lint`: pass with 1 non-blocking warning (`@next/next/no-img-element` in `app/components/idea-card.tsx`).
- `npm run build`: pass.
- Manual story checklists and SC-003 measurement: pending interactive browser execution.

## Expected Outcome
- Submitters can save, update, and delete owner-only drafts.
- Drafts stay out of admin queues until submitted.
- Final submission converts draft to submitted and locks submitter edits.
- Existing functionality from earlier phases remains stable.
