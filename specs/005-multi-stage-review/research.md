# Research: Phase 5 Multi-Stage Review

## Decision 1: Represent ReviewStage as an enum field on Idea (not a separate table)

- **Decision**: Add a `reviewStage` enum column directly to the `Idea` table with values `initial_screening`, `technical_review`, `business_impact_review`, `final_decision`. Default to `initial_screening` so existing submitted/under_review ideas are automatically placed in the pipeline without data loss.
- **Rationale**: Four fixed stages require no dynamic configurability. A direct column avoids a join and keeps the existing idea queries compatible with simple where/orderBy additions. The `reviewStage` field is semantically meaningful only when `status` is `submitted` or `under_review`; accepted/rejected ideas retain their last stage value for audit purposes.
- **Alternatives considered**:
  - Separate `ReviewStageRecord` table with a foreign key to `Idea`: rejected because it adds join complexity for a static ordered list with no independent lifecycle.
  - String field instead of enum: rejected because an unconstrained string loses type safety and prevents schema-level validation of valid stage values.

## Decision 2: Introduce StageComment as a new model separate from EvaluationComment

- **Decision**: Create a new `StageComment` model with `id`, `ideaId`, `adminId`, `stage` (ReviewStage enum), `text`, and `createdAt`. Leave the existing `EvaluationComment` model and its data untouched.
- **Rationale**: Phase 1 general evaluation comments and Phase 5 stage-scoped evaluation comments are different domain concepts with different display semantics. Adding a `stage` nullable field to `EvaluationComment` would conflate the two, making queries more complex and mixing historical data with new structured data.
- **Alternatives considered**:
  - Add optional `stage` field to existing `EvaluationComment`: rejected because it pollutes Phase 1 data semantics and complicates the display of general versus stage-specific feedback.
  - Replace `EvaluationComment` entirely: rejected because existing Phase 1–4 data and functionality must be preserved without migration of historical records.

## Decision 3: Stage transitions enforced as sequential adjacent moves only

- **Decision**: API enforces that stage advances move exactly one step forward (e.g., `initial_screening → technical_review`) and backward moves return exactly one step. Skipping stages is not permitted.
- **Rationale**: The spec defines an ordered four-stage pipeline; sequential enforcement ensures each idea passes through all evaluation gates and prevents admins accidentally bypassing a review stage. Enforcement is simple: compute the ordinal of the current stage and allow ±1 transitions.
- **Alternatives considered**:
  - Allow free movement between any stages: rejected because the spec implies structured sequential review; free movement would undermine the purpose of having defined stages.
  - Enforce forward-only (no backward): rejected because the spec explicitly states "Admins can move an idea forward or backward".

## Decision 4: Extend existing admin status endpoint for final decisions; add separate review-stage endpoint

- **Decision**: Keep `PATCH /api/admin/[ideaId]/status` as the endpoint for final `accepted`/`rejected` decisions. Add a new `PATCH /api/admin/[ideaId]/review-stage` endpoint for stage transitions. Add a new `POST /api/admin/[ideaId]/stage-comments` endpoint for stage-scoped comments.
- **Rationale**: Stage movement and final decisions are semantically distinct operations. Mixing them into one endpoint requires overloaded conditional logic. Separate endpoints make each operation explicit and independently testable.
- **Alternatives considered**:
  - Merge stage transitions and status decisions into one endpoint: rejected because the semantics diverge (stage changes are reversible/sequential; accepted/rejected are final and irreversible).
  - Add stage management to the existing status endpoint with a type discriminator: rejected because it creates implicit coupling between review flow state and final outcome state.

## Decision 5: Draft ideas have no reviewStage assignment

- **Decision**: The `reviewStage` field is `null` for draft ideas. When a draft is submitted (status transitions to `submitted`), the system automatically sets `reviewStage = initial_screening` as part of the submission operation.
- **Rationale**: The spec requires draft ideas to be excluded from the review pipeline. A null stage for drafts makes the exclusion explicit and prevents drafts from appearing in any stage-filtered query.
- **Alternatives considered**:
  - Assign `initial_screening` to drafts: rejected because it violates the pipeline exclusion requirement and would require special-case filtering in every admin stage query.
  - Use a sentinel stage value `none`: rejected because it adds a non-meaningful stage entry to the ordered enum.

## Decision 6: Backward compatibility for pre-Phase-5 ideas via schema default

- **Decision**: The `reviewStage` column has a database-level default of `initial_screening`. The migration adds this column and backfills all existing `submitted` and `under_review` ideas to `initial_screening`. Draft, accepted, and rejected ideas retain `null` (drafts) or their appropriate last stage (accepted/rejected) depending on migration logic.
- **Rationale**: FR-011 requires that ideas existing before Phase 5 are automatically assigned to Initial Screening. A schema default with a backfill migration achieves this without requiring any code changes to existing submission paths.
- **Alternatives considered**:
  - Require manual re-submission of old ideas: rejected because FR-011 explicitly prohibits this.
  - Nullable with application-level default of `initial_screening` when null: rejected because it spreads default logic across multiple code paths instead of centralizing it in the schema.

## Decision 7: Submitter visibility via extended idea detail endpoint

- **Decision**: The `GET /api/ideas/[ideaId]` response is extended to include `reviewStage` (current stage name) and `stageComments` (array of `{ id, stage, text, adminId, createdAt }`). The submitter reads this from the idea detail view. Admin names are NOT exposed to submitters; only the stage label and comment text are visible.
- **Rationale**: Submitters should see review progress without exposing admin identity, which could create unintended social dynamics. The existing detail endpoint is the natural place to extend rather than adding a new submitter-facing endpoint.
- **Alternatives considered**:
  - Separate `/api/ideas/[ideaId]/review-status` endpoint: rejected as unnecessary endpoint proliferation when the existing detail endpoint is sufficient.
  - Expose adminId/name to submitters: rejected for privacy reasons; the spec only requires stage and feedback visibility, not reviewer identity.
