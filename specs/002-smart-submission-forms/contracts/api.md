# API Contract: Smart Submission Forms (Phase 2)

## Scope
This contract defines additive changes to existing Phase 1 APIs to support category-specific dynamic fields.

## Submitter Workflows

### Create Idea (extended)
- Method: `POST`
- Path: `/api/ideas`
- Auth: submitter only
- Request body: multipart/form-data
- `title: string`
- `description: string`
- `category: string`
- `attachment: File`
- `customFields: string` (JSON-encoded object in transport; parsed and persisted as JSON object in Idea `customFields`)

Validation expectations:
- Dynamic fields required by selected category must be present and valid.
- `estimatedTimeSavingsHours` must be positive integer when category is Process Improvement.
- `implementationComplexity` must be one of `low`, `medium`, `high` when category is Technical Innovation.

Response:
- `201`: `{ success: true, idea: { id, title, status } }`
- `400`: `{ error: string, fieldErrors?: Record<string, string> }`

Persistence note:
- `customFields` is stored as nullable JSON object.
- For category `Other`, server accepts `customFields` as null or `{}`.

### Get Current Submitter Ideas (extended)
- Method: `GET`
- Path: `/api/ideas`
- Auth: submitter only
- Response:
- `200`: `{ ideas: [ { id, title, description, category, status, customFields, attachment, createdAt } ] }`

## Admin Workflows

### Get All Ideas (extended)
- Method: `GET`
- Path: `/api/admin/ideas`
- Auth: admin only
- Response:
- `200`: `{ ideas: [ { id, title, description, category, status, customFields, submitter, attachment, evaluationComments } ] }`

UI presentation requirement:
- Admin idea details render category-specific `customFields` with category-aware labels.

## Backward Compatibility
- Existing clients that do not send `customFields` remain valid only for categories without required dynamic fields.
- Existing response fields are preserved; `customFields` is additive.
