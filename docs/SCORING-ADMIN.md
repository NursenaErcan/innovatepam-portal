# Phase 7 Scoring System - Admin Guide

## Overview

The Phase 7 Scoring System enables admins to evaluate ideas using a multi-dimensional scoring framework during the review pipeline. Scores are captured at various review stages and aggregated for submitter feedback after Final Decision.

## Quick Start: Scoring an Idea

1. **Navigate to Review Panel**: Go to Admin > Ideas to view active ideas
2. **Find the Idea**: Locate the idea at Technical Review, Business Impact Review, or Final Decision stage
3. **Enter Scores**: Scroll down to "Evaluation Scores" section
4. **Rate 3 Dimensions**:
   - **Innovation**: How novel and original is the idea? (1-5)
   - **Feasibility**: How realistic and achievable? (1-5)
   - **Business Impact**: What's the potential value to the business? (1-5)
5. **Save**: Click "Save" for each dimension
6. **Verify**: Scores persist immediately and survive page refresh

## Scoring Scale

| Score | Meaning |
|-------|---------|
| 1 | Poor - Significant concerns |
| 2 | Below Average - Notable weaknesses |
| 3 | Average - Meets baseline requirements |
| 4 | Above Average - Strong candidate |
| 5 | Excellent - Outstanding potential |

## Review Stages & Scoring Timeline

### Initial Screening Stage
- **Purpose**: First pass - general viability check
- **Scoring**: Optional (not enforced)
- **Typical Role**: Senior reviewer or innovation manager

### Technical Review Stage
- **Purpose**: Technical feasibility assessment
- **Scoring**: Focus on FEASIBILITY and INNOVATION dimensions
- **Typical Role**: Technical lead or subject matter expert
- **Timing**: ~2-3 reviewers per idea

### Business Impact Review Stage
- **Purpose**: Strategic value and market potential
- **Scoring**: All three dimensions, focus on BUSINESS_IMPACT
- **Typical Role**: Business analyst or product manager
- **Timing**: Additional reviewers join

### Final Decision Stage
- **Purpose**: Final review before Accept/Reject decision
- **Scoring**: All three dimensions (optional last-minute updates)
- **Decision**: Accept or Reject (button in UI)
- **Important**: Scores persist after decision and visible to submitters

## Multi-Reviewer Workflow

### When Multiple Admins Score

**Example**: 3 reviewers evaluate same idea
```
Reviewer A:  Innovation=4  Feasibility=5  Business Impact=3
Reviewer B:  Innovation=5  Feasibility=4  Business Impact=5
Reviewer C:  Innovation=4  Feasibility=4  Business Impact=4

Aggregated:  Innovation=4.33  Feasibility=4.33  Business Impact=4
```

- Each reviewer's score is stored independently
- Submitter sees **averages only** (not individual scores)
- Submitter cannot see who scored what
- No duplicate scores: one score per reviewer per dimension per idea

### Viewing Existing Scores

When you open an idea that's already been scored:
- Input fields pre-populate with the latest score for each dimension
- You can **update any score** by entering a new value and clicking Save
- Previous score is replaced (version history not preserved in MVP)
- Updated timestamp reflects the edit

## Important Rules & Constraints

### ✅ Can Score
- [ ] Ideas at Technical Review stage
- [ ] Ideas at Business Impact Review stage
- [ ] Ideas at Final Decision stage
- [ ] Any dimension individually (don't need to score all 3)
- [ ] Update existing scores multiple times
- [ ] Score the same idea with different reviewers

### ❌ Cannot Score
- [ ] **Draft ideas** - Validation prevents this at both API and UI
- [ ] Ideas after Final Decision (status = accepted/rejected) - UI disabled
- [ ] Out-of-range values (0, 6, decimals like 1.5) - Validation error
- [ ] Non-numeric values - Validation error

### API Error Codes

If something goes wrong, you'll see:
- **400 Bad Request**: Invalid score value (0, 6, or non-numeric) or missing dimension
- **404 Not Found**: Idea doesn't exist
- **409 Conflict**: Attempting to score draft idea
- **403 Forbidden**: Not authenticated as admin
- **500 Internal Error**: Server issue (contact support)

## Best Practices

### Timing
- ✅ Score during each review stage (don't wait until Final Decision)
- ✅ Score as soon as you've formed an opinion
- ❌ Don't delay scoring until later stages

### Consistency
- ✅ Use the scale consistently across ideas
- ✅ Calibrate with team on what 3/4/5 means
- ❌ Don't score 5/5 for all ideas

### Collaboration
- ✅ Discuss borderline ideas (3-4 scores) with colleagues
- ✅ Review peer scores before Final Decision
- ❌ Don't let others' scores pressure your independent judgment

### Review Process
1. Read idea description and attachments
2. Check existing stage comments from other reviewers
3. Form independent opinion
4. Enter scores for all relevant dimensions
5. Add stage comment explaining your assessment (optional but recommended)
6. Advance to next stage or prepare Final Decision

## Troubleshooting

### "Cannot score draft ideas"
**Problem**: You see error "Cannot score draft ideas"  
**Cause**: Idea status is still "draft" (not yet submitted)  
**Solution**: Idea must be submitted by submitter first. Check status in review panel.

### Score not saving
**Problem**: Clicked Save but score didn't persist  
**Cause**: Network error, validation error, or permission issue  
**Solution**: 
- Check error message in red text below input
- Verify value is 1-5 and numeric
- Check browser console for network errors
- Refresh and try again

### Can't see score inputs
**Problem**: No "Evaluation Scores" section visible  
**Cause**: Idea is in draft status or not yet in review pipeline  
**Solution**: Verify idea is submitted and in a review stage (not draft)

### Scores disappeared after decision
**Problem**: Scores were visible, then disappeared  
**Cause**: Scores should persist and are not supposed to disappear  
**Solution**: Refresh page. If still missing, contact support (possible data issue).

## Technical Details

### Database Storage
- Scores stored in `IdeaScore` table
- Composite unique key: (ideaId, dimension, reviewedBy)
- Creates/updates in single operation (upsert)
- Cascade delete: if idea deleted, scores deleted too
- Restrict delete: can't delete user if they have scores

### Score Visibility
- **Admins**: See all scores for all ideas, all reviewers
- **Submitters**: See aggregated average only (post-decision only)
- **Others**: No access

### Aggregation Logic
- Simple arithmetic mean per dimension
- Null if no scores for dimension
- No weighting or conflict resolution
- Rounding: display as recorded (1.0, 1.5, 4.33, etc.)

## Related Documentation

- [Phase 7 Scoring Architecture](../research.md)
- [Submitter Score Summary Guide](SCORING-SUBMITTER.md)
- [API Endpoints](../contracts/api.md)

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review [QA Checklist](../checklists/qa-checklist.md) for common issues
3. Contact product team or innovation manager
