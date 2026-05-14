# API Contract: Phase 3 Multi-Media Support

## Scope
This contract defines additive and compatible API changes for multi-attachment idea submissions, secure attachment retrieval, and admin preview metadata.

## Submitter APIs

### Create Idea (extended)
- Method: `POST`
- Path: `/api/ideas`
- Auth: submitter only
- Content type: `multipart/form-data`
- Fields:
- `title: string`
- `description: string`
- `category: string`
- `customFields: string` (JSON-encoded object)
- `attachment: File` (repeat field for each selected file; zero to configured max)

Validation behavior:
- Core idea fields must be valid.
- Dynamic category fields must be valid per Phase 2 rules.
- Attachment count must be <= configured cap (default 10).
- Every included file must pass allowed type and max size checks.
- Any attachment validation or persistence failure rejects the full submission.

Response:
- `201`: `{ success: true, idea: { id, title, status } }`
- `400`: `{ error: string, fieldErrors?: Record<string, string> }`
- `403`: `{ error: "Unauthorized" }`

### Get Current Submitter Ideas (extended)
- Method: `GET`
- Path: `/api/ideas`
- Auth: submitter only
- Response:
- `200`: `{ ideas: [ { id, title, description, category, status, customFields, createdAt, attachments, evaluationComments } ] }`

`attachments` item shape:
- `{ id, fileName, mimeType, size, displayOrder, downloadUrl, previewUrl? }`

## Admin APIs

### Get All Ideas (extended)
- Method: `GET`
- Path: `/api/admin/ideas`
- Auth: admin only
- Response:
- `200`: `{ ideas: [ { id, title, description, category, status, customFields, createdAt, submitter, attachments, evaluationComments } ] }`

UI requirement:
- Admin clients render image thumbnails for items with non-null `previewUrl`.

## Attachment Retrieval APIs

### Download Attachment (new)
- Method: `GET`
- Path: `/api/attachments/{attachmentId}`
- Auth: owner submitter or admin
- Behavior:
- Return attachment binary with original content type.
- Deny when requester is neither admin nor idea owner.

Response:
- `200`: binary stream
- `403`: `{ error: "Unauthorized" }`
- `404`: `{ error: "Attachment not found" }`

Preview behavior:
- For image files (`image/png`, `image/jpg`, `image/jpeg`), this endpoint is also usable as thumbnail source.
- Non-image files are link/download only.

## Backward Compatibility
- Existing ideas with one attachment remain readable and are returned with a one-item `attachments` array.
- Existing ideas without attachments remain valid.
- Existing clients using single-file submission remain compatible by sending one `attachment` field.
