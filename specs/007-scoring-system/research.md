# Research Report: Phase 7 Scoring System

**Date**: May 14, 2026  
**Feature**: Phase 7 Scoring System  
**Status**: COMPLETE

## Research Findings

### R1: Score Aggregation Strategy for Multiple Reviewers

**Question**: How should scores be aggregated when multiple admins score the same idea?

**Research**:
- Reviewed multi-reviewer systems in innovation management platforms (e.g., NSF grant review, academic peer review)
- Common approaches: unweighted average, median, consensus scoring, or per-reviewer breakdown
- For Phase 7 MVP: unweighted average is simplest and sufficient for initial version

**Decision**: Use unweighted arithmetic mean (average) of all scores per dimension, rounded to nearest 0.5 for clarity

**Rationale**: 
- Simple implementation (no weighting logic needed)
- Transparent to submitters
- Extensible to weighted/consensus scoring in future phases
- Aligns with innovation management best practices

---

### R2: Score Mutation Semantics: Per-Admin Tracking vs. Overwrite

**Question**: Should each admin have separate scores, or do new scores overwrite older ones?

**Research**:
- Separate per-admin tracking enables: audit trail, reviewer attribution, consensus analysis
- Overwrite semantics enable: simpler data model, latest-opinion-wins simplicity
- Constitution principle "Persistence and Accessibility" favors audit trail

**Decision**: Track scores per-admin. IdeaScore model includes `reviewedBy` foreign key. Composite unique constraint on (ideaId, dimension, reviewedBy) ensures one score per reviewer per dimension.

**Rationale**:
- Supports audit requirements and future consensus features
- Enables feedback like "3 reviewers rate feasibility as 4+, 1 rates as 2"
- Fair attribution of evaluations
- Aligned with Phase 5 multi-stage review pattern (stage-scoped comments)

---

### R3: Score Visibility During Non-Final Stages

**Question**: Can admin A see scores from admin B during review pipeline, before Final Decision?

**Research**:
- Innovation platforms vary: some hide peer scores until decision, others show live feedback
- Showing peer scores during review enables: calibration, discussion, consensus-building
- Hiding scores until final: reduces anchoring bias, ensures independent evaluation

**Decision**: Full visibility to all admin users throughout pipeline. Scores only hidden from submitters until Final Decision is reached.

**Rationale**:
- Enables collaborative review and calibration
- Supports discussion around conflicting scores
- Submitter privacy preserved (primary requirement)
- Simpler implementation (no staged visibility rules)

---

### R4: Rejected Resubmission Score Handling

**Question**: If idea is rejected, then submitter resubmits later, how are old scores treated?

**Research**:
- Scenario: Idea submitted, scored, rejected. Submitter revises and resubmits months later.
- Old approach: link scores directly to Idea record (scores change with status)
- New approach: treat resubmission as new Idea record (old scores orphaned but retained for audit)

**Decision**: Resubmitted ideas create new Idea records (existing Phase 1 behavior). Old scores from previous submission are retained in database but not visible to submitter for new submission.

**Rationale**:
- Maintains audit trail and submission history
- Prevents stale scores from contaminating new evaluation
- Submitter starts fresh with new submission
- Aligns with existing draft/resubmission workflow

---

### R5: Score Input Validation and Optionality

**Question**: Are scores required, or can admin complete review without scoring?

**Research**:
- Spec requirement FR-004 states "Scores are optional during review"
- Some systems enforce mandatory scoring; others allow comment-only reviews
- Optional approach: more flexible, respects reviewer preference

**Decision**: Scores are optional. Admin can save review without scores. Input validation only applies if value is provided (must be 1-5 if not null).

**Rationale**:
- Flexibility for reviewers who prefer qualitative feedback
- Simpler form UX (no required field validation)
- Compliant with spec requirements
- Enables gradual adoption (scores can be added later)

---

### R6: Prisma Schema and Query Optimization

**Question**: How to structure IdeaScore model for optimal query patterns?

**Research**:
- Query patterns: 
  - Get all scores for idea: filter ideaId
  - Get scores by dimension: filter ideaId + dimension
  - Check if reviewer already scored: filter ideaId + dimension + reviewedBy
  - Aggregate scores: group by dimension, avg value
- Indexing strategy: composite index on frequent multi-column queries

**Decision**: Single IdeaScore table with:
- id (primary key)
- ideaId (FK to Idea)
- dimension (enum: INNOVATION | FEASIBILITY | BUSINESS_IMPACT)
- value (integer 1-5)
- reviewedBy (FK to User)
- createdAt, updatedAt
- Unique constraint: (ideaId, dimension, reviewedBy)
- Indexes: standard FKs + composite on (ideaId, dimension)

**Rationale**:
- Single table for all scores (no dimension-specific tables needed)
- Composite unique constraint prevents duplicate scoring
- Efficient queries for common patterns
- Aligns with Prisma best practices and existing schema patterns

---

## Unknowns Resolved

| Unknown | Resolution | Status |
|---------|-----------|--------|
| Multiple reviewer aggregation | Simple average per dimension | ✅ Resolved |
| Per-admin vs. overwrite tracking | Per-admin with composite key | ✅ Resolved |
| Peer visibility during review | Full visibility to admins | ✅ Resolved |
| Resubmission score handling | New submission = new record | ✅ Resolved |
| Optionality of scores | Optional; validation only if provided | ✅ Resolved |
| Prisma schema structure | Single table with composite key | ✅ Resolved |

---

## Phase 0 Conclusion

✅ **All research questions resolved. No blocking unknowns remain.**

Ready to proceed to Phase 1 Design for data model, API contracts, and quick-start guide.
