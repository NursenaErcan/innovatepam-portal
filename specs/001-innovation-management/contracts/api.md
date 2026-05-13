# API Contract: InnovatEPAM Portal

## Authentication

### Register
- Method: `POST`
- Path: `/api/auth/register`
- Auth: public
- Request body:
  - `email: string`
  - `password: string`
- Response:
  - `200`: `{ success: true, user: { id, email, role } }`
  - `400`: `{ error: string }`

### Login
- Method: `POST`
- Path: `/api/auth/login`
- Auth: public
- Request body:
  - `email: string`
  - `password: string`
- Response:
  - `200`: `{ success: true, user: { id, email, role } }`
  - `401`: `{ error: string }`

### Logout
- Method: `POST`
- Path: `/api/auth/logout`
- Auth: required
- Response:
  - `200`: `{ success: true }`

## Submitter Workflows

### Create Idea
- Method: `POST`
- Path: `/api/ideas`
- Auth: submitter only
- Request body: multipart/form-data
  - `title: string`
  - `description: string`
  - `category: string`
  - `attachment: File`
- Response:
  - `201`: `{ success: true, idea: { id, title, status } }`
  - `400`: `{ error: string }`

### Get Current Submitter Ideas
- Method: `GET`
- Path: `/api/ideas`
- Auth: submitter only
- Response:
  - `200`: `{ ideas: [ { id, title, description, category, status, attachment, createdAt } ] }`

## Admin Workflows

### Get All Ideas
- Method: `GET`
- Path: `/api/admin/ideas`
- Auth: admin only
- Response:
  - `200`: `{ ideas: [ { id, title, description, category, status, submitter: { id, email }, attachment, evaluationComments } ] }`

### Update Idea Status
- Method: `PATCH`
- Path: `/api/admin/ideas/:ideaId/status`
- Auth: admin only
- Request body:
  - `status: "submitted" | "under review" | "accepted" | "rejected"`
- Response:
  - `200`: `{ success: true, idea: { id, status } }`
  - `400`: `{ error: string }`

### Add Evaluation Comment
- Method: `POST`
- Path: `/api/admin/ideas/:ideaId/comments`
- Auth: admin only
- Request body:
  - `commentText: string`
- Response:
  - `201`: `{ success: true, comment: { id, commentText, createdAt } }`

## Attachment Access

### Static Attachment URL (Phase 1)
- Method: `GET`
- Path: `/uploads/:filename`
- Auth: public static file access in local MVP
- Response:
  - `200`: file stream
  - `404`: file not found

### Protected Download Route
- Out of scope for Phase 1 MVP. Role-aware protected attachment delivery is deferred to a later phase.

## Session Contract

### Cookie
- Name: `innovatepam_session`
- Value: opaque session token
- Flags: `HttpOnly`, `Secure` in production, `SameSite=Lax`

## Error Format

- Standard API error response:
  - `400`, `401`, `403`, `404`, `500`
  - Body: `{ error: string }`
