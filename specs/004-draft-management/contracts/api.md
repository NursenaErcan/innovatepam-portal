# API Contract: Phase 4 Draft Management

## Scope
This contract defines additive API behavior for draft save/update/delete/submit lifecycle while preserving existing Phase 1-3 flows.

## Submitter APIs

### List Submitter Ideas (extended)
- Method: `GET`
- Path: `/api/ideas`
- Auth: submitter only
- Response:
- `200`: `{ ideas: IdeaSummary[] }`

`IdeaSummary` additions:
- `status` includes `draft`
- `isEditable` (derived in UI) when status is draft and owner matches auth user

### Save New Draft (new behavior)
- Method: `POST`
- Path: `/api/ideas`
- Auth: submitter only
- Content type: `multipart/form-data`
- Fields:
- `title?: string`
- `description?: string`
- `category?: string`
- `customFields?: string` (JSON object)
- `attachment: File` (repeatable, optional)
- `submissionMode: "draft" | "final"` (new required control flag)

Behavior:
- `submissionMode = draft`: persist partial payload with `status = draft`.
- `submissionMode = final`: apply existing strict validation and create/submit as `submitted`.
- if `submissionMode` is omitted, treat as `final` for backward compatibility.

Responses:
- `201`: `{ success: true, idea: { id, title, status } }`
- `400`: `{ error: string, fieldErrors?: Record<string, string> }`
- `403`: `{ error: "Unauthorized" }`

### Update Existing Draft (new)
- Method: `PATCH`
- Path: `/api/ideas/{ideaId}`
- Auth: submitter owner only
- Content type: `multipart/form-data` or `application/json` (implementation choice)
- Behavior:
- Allowed only when target idea status is `draft`.
- Re-saves payload in place without creating duplicate idea record.
- Route responsibility: `app/api/ideas/[ideaId]/route.ts` handles PATCH and DELETE for draft records.

Responses:
- `200`: `{ success: true, idea: { id, status: "draft" } }`
- `400`: invalid payload
- `403`: unauthorized/owner mismatch
- `404`: idea not found
- `409`: idea is no longer draft/editable

### Delete Draft (new)
- Method: `DELETE`
- Path: `/api/ideas/{ideaId}`
- Auth: submitter owner only
- Behavior:
- Allowed only for `status = draft`.

Responses:
- `200`: `{ success: true }`
- `403`: unauthorized/owner mismatch
- `404`: draft not found
- `409`: idea is no longer draft/deletable

### Submit Draft (new)
- Method: `POST`
- Path: `/api/ideas/{ideaId}/submit`
- Auth: submitter owner only
- Behavior:
- Allowed only for `status = draft`.
- Applies strict final validation (core fields, category custom fields, attachments).
- On success transitions status to `submitted` on same idea ID.
- On failure returns validation errors and keeps draft editable.
- Route responsibility: `app/api/ideas/[ideaId]/submit/route.ts` handles final submission transition.

Responses:
- `200`: `{ success: true, idea: { id, status: "submitted" } }`
- `400`: `{ error: string, fieldErrors?: Record<string, string> }`
- `403`: unauthorized/owner mismatch
- `404`: draft not found
- `409`: idea is no longer draft/submittable

## Admin APIs

### List Admin Ideas (filtered)
- Method: `GET`
- Path: `/api/admin/ideas`
- Auth: admin only
- Behavior:
- Excludes all ideas where `status = draft`.

Responses:
- `200`: `{ ideas: IdeaSummary[] }` (non-draft only)
- `403`: `{ error: "Unauthorized" }`

## Authorization Rules
- Submitter can view/mutate only own drafts.
- Admin cannot access submitter-only draft mutation endpoints.
- Draft rows are never returned in admin queue/list endpoints.

## Backward Compatibility
- Existing creation flow remains valid by defaulting `submissionMode` to `final` for older clients that do not send it.
- Existing submitted ideas and review/status endpoints continue unchanged.
- Existing attachment retrieval permissions (owner submitter/admin) remain unchanged.
