# Research: Phase 4 Draft Management

## Decision 1: Represent draft lifecycle in `Idea.status`

- Decision: Add a `draft` value to the existing `IdeaStatus` enum and keep draft + submitted records in the same `Idea` table.
- Rationale: A single table preserves existing attachment/comment relationships, simplifies transitions, and keeps Phase 1-3 queries compatible with targeted filters.
- Alternatives considered:
- Separate `DraftIdea` table: rejected due to duplicated schema and migration complexity for conversion to submitted ideas.
- Keep `submitted` as default and use nullable marker fields: rejected because status semantics become implicit and error-prone.

## Decision 2: Save draft with relaxed validation, submit with strict validation

- Decision: Introduce draft-save validation that allows partial title/description/custom fields, while final submission reuses the current strict idea/custom-field/attachment validation path.
- Rationale: This satisfies FR-001/FR-009 while preserving current submission quality rules and regression safety.
- Alternatives considered:
- Enforce full validation for draft save: rejected because it blocks unfinished work.
- Skip validation entirely for drafts: rejected because basic shape checks are still needed to avoid corrupt data.

## Decision 3: Keep owner-only draft visibility by query filtering + auth checks

- Decision: Restrict draft reads/updates/deletes to `submitterId === currentUser.id` and filter admin list endpoints to exclude `status = draft`.
- Rationale: Existing role/auth middleware already exists; adding precise where clauses is the simplest secure approach.
- Alternatives considered:
- Hide drafts only in UI: rejected because API-level leakage risk remains.
- Add per-record ACL table: rejected as unnecessary complexity for single-owner model.

## Decision 4: Final submission is an in-place state transition

- Decision: Convert draft to submitted by updating the same row (`status: draft -> submitted`) after passing strict validation.
- Rationale: Preserves stable idea ID, keeps attachment references intact, and avoids duplicate records.
- Alternatives considered:
- Clone draft into new submitted row: rejected due to duplicate history and mapping complexity.
- Hard-delete draft then create new idea: rejected due to race conditions and potential data loss.

## Decision 5: Enforce submitter read-only behavior in both UI and API

- Decision: Disable submitter edit actions for non-draft statuses in UI and reject draft-only mutation endpoints when status is not `draft`.
- Rationale: Dual enforcement prevents accidental edits and guards against direct API calls.
- Alternatives considered:
- UI-only read-only behavior: rejected because API could still be misused.
- API-only enforcement without UI differentiation: rejected because user experience would be unclear.

## Decision 6: Preserve Phase 2 and Phase 3 compatibility during draft save/submit

- Decision: Keep `customFields` and `attachments` model unchanged; allow partial values while draft, then require full category-specific validation and existing attachment rules at final submit.
- Rationale: Reuses proven logic and minimizes regression risk while honoring FR-013.
- Alternatives considered:
- Separate draft payload schema for custom fields/attachments: rejected as duplication with low benefit.
- Disable attachments on drafts: rejected because requirement scope includes existing multimedia capability.
