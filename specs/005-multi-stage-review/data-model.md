# Data Model: Phase 5 Multi-Stage Review

## Entities

### ReviewStage (enum)

Ordered values:
1. `initial_screening`
2. `technical_review`
3. `business_impact_review`
4. `final_decision`

Ordering rules:
- Stages are strictly ordered by their ordinal position (1–4).
- An idea can advance exactly one stage forward or retreat exactly one stage backward.
- Stage transitions are only permitted when `status` is `submitted` or `under_review`.
- Accepted and rejected ideas are immutable with respect to reviewStage.

---

### Idea (extended)

New field added to existing `Idea` model:
- `reviewStage: ReviewStage | null`
  - `null` when the idea is a draft (excluded from pipeline).
  - `initial_screening` when a draft is submitted (auto-assigned on submission).
  - Advances to `technical_review`, `business_impact_review`, or `final_decision` as admin progresses review.
  - Retains last stage value after `accepted` or `rejected` final decisions (read-only audit trail).

Existing fields unchanged:
- `id`, `title`, `description`, `category`, `customFields`, `submitterId`, `status`, `createdAt`, `updatedAt`
- `attachments: Attachment[]`
- `evaluationComments: EvaluationComment[]` (Phase 1 general comments — preserved, unchanged)

New relation added:
- `stageComments: StageComment[]`

State Transitions (extended from Phase 4):

```
draft             → null reviewStage
    ↓ submit
submitted         → initial_screening
    ↓ advance
technical_review
    ↓ advance
business_impact_review
    ↓ advance
final_decision
    ↓ mark accepted/rejected
accepted | rejected  → reviewStage frozen (last stage retained, no further transitions)

Any non-final stage ← backward one step (retreat allowed by admin)
```

Validation Rules:
- `reviewStage` can only be set or changed by admin role.
- `reviewStage` transitions permitted only when `status ∈ {submitted, under_review}`.
- `reviewStage` transitions blocked when `status ∈ {accepted, rejected}`.
- Submitted ideas auto-receive `initial_screening`; no admin action required to start the pipeline.

---

### StageComment (new model)

Purpose: Stores admin evaluation comments scoped to a specific review stage and idea.

Fields:
- `id: string` — UUID primary key
- `ideaId: string` — foreign key to `Idea`
- `adminId: string` — foreign key to `User` (admin role)
- `stage: ReviewStage` — the review stage at which this comment was written
- `text: string` — the comment body
- `createdAt: DateTime` — auto-set on creation

Relationships:
- StageComment belongs to one Idea.
- StageComment belongs to one User (admin).

Validation Rules:
- `text` must be non-empty.
- `stage` must be a valid `ReviewStage` enum value.
- Only admin-role users may create StageComments.
- A StageComment may be added at any active review stage of the idea (the stage field records which stage the comment was made at, not necessarily the idea's current stage).

Display Rules:
- Comments are displayed in `createdAt` ascending order.
- Each comment displays its associated stage label (e.g., "Technical Review") alongside the text.
- Admin identity is visible to other admins on the admin detail view.
- Admin identity is NOT exposed on the submitter-facing view; only stage label + text is shown to submitters.

---

### ReviewPipelineView (UI view model — derived, not persisted)

Derived from Idea + StageComment collection:

```
{
  currentStage: ReviewStage | null,   // null for drafts
  isInPipeline: boolean,              // true when status ∈ {submitted, under_review}
  isFinal: boolean,                   // true when status ∈ {accepted, rejected}
  canAdvance: boolean,                // true when isInPipeline and currentStage < final_decision
  canRetreat: boolean,                // true when isInPipeline and currentStage > initial_screening
  stageComments: StageCommentEntry[],
}

StageCommentEntry {
  id: string,
  stage: ReviewStage,
  stageLabel: string,       // human-readable label
  text: string,
  createdAt: string,
  adminId?: string,         // only populated on admin view
}
```

---

### StageOrderMap (static definition — not persisted)

Used by API and UI to validate transitions and render ordered stage progress indicators:

```
initial_screening     → ordinal 1  → label "Initial Screening"
technical_review      → ordinal 2  → label "Technical Review"
business_impact_review → ordinal 3 → label "Business Impact Review"
final_decision        → ordinal 4  → label "Final Decision"
```

---

## Lifecycle Notes

### Review Stage Lifecycle

1. Submitter submits idea → `status = submitted`, `reviewStage = initial_screening`.
2. Admin opens Initial Screening view, optionally adds a stage comment, then advances idea.
3. Idea moves to `technical_review`; previous comments remain associated with `initial_screening`.
4. Admin progresses through Technical Review and Business Impact Review in the same pattern.
5. At `final_decision`, admin marks the idea as Accepted or Rejected.
6. `status` becomes `accepted` or `rejected`; `reviewStage` is frozen at `final_decision`.

### Backward Compatibility Notes

- Existing `EvaluationComment` records and the `EvaluationComment` model are preserved with no schema or behavior changes.
- Existing `submitted`, `under_review`, `accepted`, and `rejected` ideas from Phase 1–4 are backfilled to `initial_screening` by migration (for non-final and `under_review` ideas) or retain their last natural stage (for `accepted`/`rejected`, set to `final_decision` in migration if desired, otherwise `initial_screening` as a safe default).
- The `PATCH /api/admin/[ideaId]/status` endpoint behavior for direct `accepted`/`rejected` decisions is preserved; Phase 5 adds stage movement endpoints alongside it.
- Draft ideas and their privacy rules from Phase 4 are fully preserved.
