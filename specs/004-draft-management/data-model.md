# Data Model: Phase 4 Draft Management

## Entities

### Idea (extended)
- Existing fields remain:
- `id`, `title`, `description`, `category`, `customFields`, `submitterId`, `createdAt`, `updatedAt`
- `status` enum extends to include:
- `draft`, `submitted`, `under_review`, `accepted`, `rejected`
- Existing relations remain:
- `attachments: Attachment[]`
- `evaluationComments: EvaluationComment[]`

Relationships
- Idea belongs to one submitter.
- Idea has zero or more attachments.
- Idea has zero or more evaluation comments.

Validation Rules
- Draft save allows incomplete core and category-specific fields.
- Draft update is allowed only when `status = draft` and requester is owner submitter.
- Final submit requires existing full validation for title/description/category/custom fields/attachments.
- Non-draft ideas are read-only for submitters.

State Transitions
- `new -> draft` via save draft.
- `draft -> draft` via re-save updates.
- `draft -> submitted` via successful final submission.
- `submitted -> under_review|accepted|rejected` via existing admin review workflow.
- `submitted|under_review|accepted|rejected` are immutable for submitter edits/deletes.

### DraftVisibilityRule (derived domain rule)
- Draft record visibility: owner submitter only.
- Admin queue visibility: drafts excluded.
- Cross-user submitter visibility: denied.

Enforcement Rules
- Submitter draft list queries must include `where: { submitterId: currentUser.id, status: draft }` (or equivalent owner scoping).
- Admin list queries must include `where: { status: { not: draft } }`.
- Draft mutation endpoints (`update`, `delete`, `submit`) must verify owner + draft status.

### SubmissionViewState (UI view model)
- `isDraft: boolean`
- `canEdit: boolean` (true only when owner and draft)
- `canDelete: boolean` (true only when owner and draft)
- `canSubmit: boolean` (true only when owner and draft)
- `readOnlyReason: string | null`

Usage
- Submitter dashboard groups or labels draft vs submitted ideas.
- UI actions are enabled/disabled by state while API remains source of truth.

## Lifecycle Notes

### Draft Lifecycle
1. Submitter starts idea and clicks save draft.
2. System stores partial data with `status = draft`.
3. Submitter reopens draft and updates fields/attachments.
4. Submitter may delete draft (owner only) or submit draft.
5. On submit, strict validation runs; success transitions to `submitted`; failure keeps editable draft.

### Privacy and Queue Lifecycle
- Drafts appear only in owner submitter workspace.
- Drafts are absent from admin review APIs and UI.
- After submission, idea appears in admin queue as normal submitted item.

## Backward Compatibility Notes
- Existing non-draft ideas remain valid and unchanged.
- Existing Phase 1-3 API consumers continue working when non-draft filter is applied for admin views.
- Existing dynamic custom fields and attachments continue to function; draft mode only changes when strict validation is enforced.
