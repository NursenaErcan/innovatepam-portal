# Research & Findings: Blind Review

**Feature**: Phase 6 Blind Review  
**Date**: 2026-05-14  
**Status**: Complete — no [NEEDS CLARIFICATION] items remain

---

## Research Questions & Findings

### Q1: Privacy-Preserving UI Patterns for Conditional Identity Hiding

**Decision**: Use React component-level conditional rendering with `showSubmitter` prop controlled by reviewStage logic.

**Rationale**: 
- Phase 5 already established the pattern: IdeaCard accepts a `showSubmitter` boolean prop that controls rendering of submitter identity fields.
- Admins viewing ideas at blind stages will trigger `showSubmitter=false`; Final Decision and resolved statuses will trigger `showSubmitter=true`.
- This is the simplest, most maintainable approach for a Next.js application—no extra abstraction needed.

**Alternatives Considered**:
1. **Server-side response filtering** (strip submitter from JSON): Requires API endpoint modifications and couples the API layer to UI concerns. Rejected because component-level control is clearer.
2. **CSS-based hiding** (display: none): Works but less explicit and harder to audit. Rejected because prop-based control is clearer intent.
3. **Role-based authorization middleware**: Overkill for a rendering decision. Rejected because reviewStage is the source of truth, not admin role.

**Implementation Notes**:
- Determine blind status at component render time: `const isBlindStage = ['initial_screening', 'technical_review', 'business_impact_review'].includes(idea.reviewStage)`
- Pass to IdeaCard: `<IdeaCard showSubmitter={!isBlindStage} ... />`
- IdeaCard conditionally renders submitter section based on prop

---

### Q2: API Endpoint Contract Changes for Blind Review

**Decision**: Admin API endpoint (`GET /api/admin/ideas`) optionally masks submitter field in response JSON when idea is at a blind stage.

**Rationale**:
- If admin frontend requests the idea and wants to render it blind, the API can pre-filter the response for defense-in-depth.
- This provides two layers: API filtering + UI rendering logic.
- Simpler than forcing the API to always omit submitter; filtering on demand is backward-compatible.

**Alternatives Considered**:
1. **Always include submitter in API**: UI responsible for hiding. Simpler API but less defense-in-depth. Feasible and viable—might defer to Phase 7.
2. **Separate "admin blind" endpoint**: Increases API surface. Rejected.

**Implementation Notes**:
- In `app/api/admin/ideas/route.ts`, check `idea.reviewStage` before including submitter in response
- If blind stage, omit or mask `idea.submitter` field
- Document contract in `/contracts/` directory

---

### Q3: State Transitions Under Blind Review

**Decision**: Stage transitions (advance, retreat) are unaffected. The blind review toggle applies at render time only—no state machine changes needed.

**Rationale**:
- Phase 5 already supports all four stages and transitions between them.
- Blind review is purely a presentation concern; it does not change state machine, workflow, or data model.
- When an admin advances an idea from Technical Review → Business Impact Review, it remains blind. When advanced to Final Decision, showSubmitter toggles to true and identity becomes visible.

**Alternatives Considered**:
1. **Block transitions to blind stages**: Rejects user's ability to retreat or reorganize. Rejected.
2. **Lock ideas in blind stages**: Prevents progress. Rejected.

**Implementation Notes**:
- No changes to stage transition logic in `ReviewPipeline` component
- No changes to accept/reject controls
- Final Decision stage automatically exposes identity via reviewStage check

---

## Dependency & Integration Validation

### Existing Phase 5 Components Used

✅ `IdeaCard`: Already supports `showSubmitter` prop (added in Phase 5). Extend its logic to respect blind stages.  
✅ `AdminIdeasPanel`: Already renders `IdeaCard`. Add reviewStage-based showSubmitter logic at this level.  
✅ `ReviewPipeline`: No changes needed (stage transitions unaffected).  
✅ `StageCommentList`: Existing showAdmin prop controls comment author visibility. Unchanged; submitter identity hiding is separate concern.  

### No New Dependencies Required

- React conditional rendering (built-in)
- Tailwind CSS display utilities (already available)
- Prisma ReviewStage enum (already defined in lib/review-stages.ts)

---

## Architecture Decision Record

**ADR**: Blind review is a rendering-layer feature with reviewStage-based conditional prop logic.

**Consequence**: No schema changes, no new endpoints, no new dependencies. Implementation spans 2–3 component modifications + minimal API response filtering. Fits the "simple responsive UI" principle from constitution.

**Status**: ✅ Approved — passes constitution check.
