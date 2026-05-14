# API Contract: Phase 5 Multi-Stage Review

## Scope

This contract defines new and extended API behavior for the multi-stage review pipeline while preserving all Phase 1–4 flows unchanged.

---

## New Types

### ReviewStage (enum)
```
"initial_screening" | "technical_review" | "business_impact_review" | "final_decision"
```

### StageCommentEntry
```
{
  id: string,
  stage: ReviewStage,
  stageLabel: string,    // human-readable display label
  text: string,
  createdAt: string      // ISO 8601
}
```
Note: `adminId`/`adminName` are included only in admin-facing responses, not submitter-facing responses.

---

## Admin APIs (new)

### Transition Review Stage

- **Method**: `PATCH`
- **Path**: `/api/admin/{ideaId}/review-stage`
- **Auth**: admin only
- **Content type**: `application/json`
- **Body**:
  ```json
  {
    "direction": "forward" | "backward"
  }
  ```
- **Behavior**:
  - Computes the ordinal of the current `reviewStage`.
  - `forward`: advances to next stage (ordinal + 1). Blocked if already at `final_decision`.
  - `backward`: retreats to previous stage (ordinal − 1). Blocked if already at `initial_screening`.
  - Blocked entirely when `status ∈ {accepted, rejected, draft}`.
  - Blocked when `reviewStage` is null (draft ideas are excluded from pipeline).
- **Responses**:
  - `200`: `{ success: true, idea: { id, reviewStage: ReviewStage, status: IdeaStatus } }`
  - `400`: `{ error: "Cannot advance beyond final_decision" | "Cannot retreat before initial_screening" }`
  - `403`: `{ error: "Unauthorized" }`
  - `404`: `{ error: "Idea not found" }`
  - `409`: `{ error: "Stage transitions are not permitted on accepted or rejected ideas" }`

---

### Add Stage Comment

- **Method**: `POST`
- **Path**: `/api/admin/{ideaId}/stage-comments`
- **Auth**: admin only
- **Content type**: `application/json`
- **Body**:
  ```json
  {
    "text": "string (required, non-empty)",
    "stage": "ReviewStage (required)"
  }
  ```
- **Behavior**:
  - Creates a new `StageComment` record scoped to the provided `stage`.
  - The `stage` in the body does not need to match the idea's current `reviewStage`; it records the stage context the admin intends to annotate.
  - Blocked for draft ideas.
- **Responses**:
  - `201`: `{ success: true, comment: StageCommentEntry & { adminId: string } }`
  - `400`: `{ error: string }` — empty text or invalid stage
  - `403`: `{ error: "Unauthorized" }`
  - `404`: `{ error: "Idea not found" }`
  - `409`: `{ error: "Stage comments are not permitted on draft ideas" }`

---

### Get Admin Idea Detail (extended)

- **Method**: `GET`
- **Path**: `/api/admin/{ideaId}` *(or existing admin detail endpoint)*
- **Auth**: admin only
- **Response additions** (alongside existing fields):
  ```json
  {
    "reviewStage": "ReviewStage | null",
    "stageComments": [
      {
        "id": "string",
        "stage": "ReviewStage",
        "stageLabel": "string",
        "text": "string",
        "adminId": "string",
        "createdAt": "ISO 8601"
      }
    ]
  }
  ```
- **Behavior**: Returns all stage comments ordered by `createdAt` ascending. Returns `reviewStage: null` for draft ideas.

---

## Admin APIs (existing, unchanged behavior + enforcement note)

### Update Idea Status (final decisions)

- **Method**: `PATCH`
- **Path**: `/api/admin/{ideaId}/status`
- **Auth**: admin only
- **Body**: `{ "status": "accepted" | "rejected" | "under_review" | "submitted" }`
- **Unchanged behavior**: Sets status directly; existing logic preserved.
- **Phase 5 enforcement note**: When `status` transitions to `accepted` or `rejected`, the `reviewStage` field is NOT cleared; it retains its last value for audit purposes. This is applied automatically by the schema default and requires no additional code change to the status endpoint.

### List Admin Ideas (unchanged — draft exclusion from Phase 4 preserved)

- **Method**: `GET`
- **Path**: `/api/admin/ideas`
- **Auth**: admin only
- **Response**: unchanged; `reviewStage` field MAY be included in each idea summary for display in the admin queue list view.
- **Draft exclusion**: `status = draft` filter from Phase 4 remains in effect.

---

## Submitter APIs (extended)

### Get Idea Detail (extended for stage visibility)

- **Method**: `GET`
- **Path**: `/api/ideas/{ideaId}`
- **Auth**: submitter owner only (existing auth rule)
- **Response additions** (alongside existing idea fields):
  ```json
  {
    "reviewStage": "ReviewStage | null",
    "reviewStageLabel": "string | null",
    "stageComments": [
      {
        "id": "string",
        "stage": "ReviewStage",
        "stageLabel": "string",
        "text": "string",
        "createdAt": "ISO 8601"
      }
    ]
  }
  ```
- **Behavior**:
  - `reviewStage` is `null` and `stageComments` is `[]` for draft ideas.
  - For submitted/under_review ideas, returns the current stage name and all stage comments in `createdAt` ascending order.
  - `adminId` and admin name are NOT included in the submitter response (privacy rule from research Decision 7).

---

## Unchanged APIs (Phase 1–4 contracts fully preserved)

The following endpoints are not modified by Phase 5:
- `POST /api/ideas` — idea creation and draft save
- `PATCH /api/ideas/{ideaId}` — draft update
- `DELETE /api/ideas/{ideaId}` — draft deletion
- `POST /api/ideas/{ideaId}/submit` — draft final submission (auto-assigns `initial_screening` on success)
- `GET /api/ideas` — submitter idea list
- `POST /api/admin/{ideaId}/comments` — general evaluation comments (Phase 1)
- `GET /api/attachments/{attachmentId}` — attachment download
- `POST/DELETE /api/attachments/{attachmentId}` — attachment management

---

## Stage Label Reference

| Enum value              | Display label              |
|-------------------------|----------------------------|
| `initial_screening`     | "Initial Screening"        |
| `technical_review`      | "Technical Review"         |
| `business_impact_review`| "Business Impact Review"   |
| `final_decision`        | "Final Decision"           |
