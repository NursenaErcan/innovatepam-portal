# API Contract: Blind Review

**Feature**: Phase 6 Blind Review  
**Date**: 2026-05-14  
**Scope**: Admin-facing endpoints that support conditional identity masking

---

## Endpoint: GET /api/admin/ideas

**Purpose**: Fetch admin review queue with optional blind-stage identity filtering

**Request**:
```http
GET /api/admin/ideas HTTP/1.1
Authorization: Bearer {adminToken}
```

**Query Parameters**:
None (blind review filtering is automatic based on idea.reviewStage)

**Response Body**:

### Blind Stage Response (Initial Screening, Technical Review, Business Impact Review)

```json
{
  "ideas": [
    {
      "id": "idea-123",
      "title": "Improve API Performance",
      "description": "...",
      "category": "technical",
      "status": "submitted",
      "reviewStage": "technical_review",
      "customFields": { ... },
      "submitter": null,
      "createdAt": "2026-05-14T10:00:00Z",
      "attachments": [ ... ],
      "stageComments": [ ... ]
    }
  ]
}
```

**Notes**:
- `submitter` field is `null` when idea is at a blind stage
- All other fields present (title, description, category, etc.)
- Stage comments are included with their text and stage, but admin identity (`adminId`) is not exposed

### Non-Blind Stage Response (Final Decision, Accepted, Rejected)

```json
{
  "ideas": [
    {
      "id": "idea-456",
      "title": "New Mobile App Feature",
      "description": "...",
      "category": "feature",
      "status": "submitted",
      "reviewStage": "final_decision",
      "customFields": { ... },
      "submitter": {
        "id": "user-789",
        "email": "john.doe@example.com",
        "name": "John Doe"
      },
      "createdAt": "2026-05-14T09:00:00Z",
      "attachments": [ ... ],
      "stageComments": [ ... ]
    }
  ]
}
```

**Notes**:
- `submitter` field is fully populated (id, email, name)
- All other fields present as usual

---

## Endpoint: GET /api/ideas/{ideaId}

**Purpose**: Fetch individual idea detail (used by both submitter and admin in different contexts)

**Authentication**:
- Submitter: Own ideas only  
- Admin: All ideas (with blind-stage filtering)

**Request**:
```http
GET /api/ideas/{ideaId} HTTP/1.1
Authorization: Bearer {token}
```

**Response (Submitter)**:

```json
{
  "id": "idea-789",
  "title": "...",
  "description": "...",
  "submitter": {
    "id": "user-current",
    "email": "submitter@example.com",
    "name": "Submitter Name"
  },
  "status": "submitted",
  "reviewStage": "technical_review",
  "stageComments": [ ... ]
}
```

**Notes**:
- Submitter always sees their own submitter identity (no blind filtering)

**Response (Admin, Blind Stage)**:

```json
{
  "id": "idea-789",
  "title": "...",
  "description": "...",
  "submitter": null,
  "status": "submitted",
  "reviewStage": "technical_review",
  "stageComments": [ ... ]
}
```

**Notes**:
- Admin requesting an idea at blind stage receives `submitter: null`

**Response (Admin, Final Decision)**:

```json
{
  "id": "idea-456",
  "title": "...",
  "description": "...",
  "submitter": {
    "id": "user-789",
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "status": "submitted",
  "reviewStage": "final_decision",
  "stageComments": [ ... ]
}
```

**Notes**:
- Admin requesting an idea at Final Decision receives full submitter identity

---

## Response Body Schema

### Idea Object

```typescript
interface IdeaResponse {
  id: string                           // Unique identifier
  title: string                        // Idea title (never masked)
  description: string                  // Idea description (never masked)
  category: string                     // Category (never masked)
  status: IdeaStatus                   // submitted | accepted | rejected | ...
  reviewStage: ReviewStage             // Determines blind filtering
  customFields?: Record<string, any>   // Category-specific fields (never masked)
  submitter: UserIdentity | null       // Masked based on reviewStage
  createdAt: string                    // ISO 8601 timestamp
  updatedAt?: string                   // ISO 8601 timestamp
  attachments: Attachment[]            // Never masked
  stageComments: StageComment[]        // Never masked; comment author ID not exposed
  evaluationComments?: EvaluationComment[]  // (If present; not masked)
}

interface UserIdentity {
  id: string
  email: string
  name?: string
}

interface StageComment {
  id: string
  text: string
  stage: ReviewStage
  createdAt: string
  adminId?: string  // NOT included in response (showAdmin=false in UI)
}

enum ReviewStage {
  initial_screening,
  technical_review,
  business_impact_review,
  final_decision
}
```

---

## Masking Rules

| Field | Blind Stage | Non-Blind Stage | Reason |
|-------|-------------|-----------------|--------|
| `submitter.id` | null | included | Hide submitter identity |
| `submitter.email` | null | included | Hide submitter identity |
| `submitter.name` | null | included | Hide submitter identity |
| `stageComments[].text` | included | included | Comments are idea-specific, not submitter-specific |
| `stageComments[].stage` | included | included | Stage label is audit trail |
| `stageComments[].adminId` | hidden | hidden | Admin identity never exposed in JSON (showAdmin=false) |
| `title`, `description`, `category` | included | included | Never masked |
| `customFields` | included | included | Never masked |
| `attachments` | included | included | Never masked |
| `status`, `reviewStage` | included | included | Never masked (system metadata) |

---

## Error Handling

### 401 Unauthorized
If the requesting user is not authenticated or is not an admin, return:
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
If a submitter requests another user's idea:
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
If the idea does not exist:
```json
{
  "error": "Not Found"
}
```

---

## Backward Compatibility

✅ **No breaking changes**: Previous API responses included submitter. Clients must now handle `submitter: null` gracefully.  
✅ **Graceful degradation**: Frontend already has conditional rendering for submitter identity (Phase 5). Null submitter is already handled.  
✅ **Non-blind stages unchanged**: Accepted/Rejected ideas return full submitter identity as before.

---

## Implementation Notes

- **Where to filter**: `app/api/admin/ideas/route.ts` and `app/api/ideas/[ideaId]/route.ts`
- **Filtering logic**:
  ```typescript
  const blindStages = ['initial_screening', 'technical_review', 'business_impact_review']
  const isBlind = blindStages.includes(idea.reviewStage)
  const submitterToReturn = isBlind ? null : idea.submitter
  ```
- **Defense-in-depth**: Filter at API level (response layer) + UI level (component conditional rendering)
