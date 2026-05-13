# Data Model: InnovatEPAM Portal

## Entities

### User
- `id: string` (UUID)
- `email: string`
- `hashedPassword: string`
- `role: "submitter" | "admin"`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relationships
- One user can own many `Idea` records.
- One admin can create many `EvaluationComment` records.

Validation Rules
- `email` must be unique and valid for login.
- `hashedPassword` must be generated with bcrypt.
- `role` must be either `submitter` or `admin`.

### Idea
- `id: string` (UUID)
- `title: string`
- `description: string`
- `category: "Technical Innovation" | "Process Improvement" | "Client Solution" | "Other"`
- `status: "submitted" | "under review" | "accepted" | "rejected"`
- `submitterId: string`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relationships
- One idea belongs to one submitter (`User`).
- One idea has one `Attachment`.
- One idea can have many `EvaluationComment` records.

Validation Rules
- `title`, `description`, and `category` are required fields.
- `category` must be one of the fixed set: Technical Innovation, Process Improvement, Client Solution, or Other.
- `status` defaults to `submitted` on creation.
- Only one attachment is allowed per idea.

### Attachment
- `id: string` (UUID)
- `ideaId: string`
- `fileName: string`
- `storagePath: string` (local path under `public/uploads`)
- `mimeType: string`
- `size: number`
- `createdAt: DateTime`

Relationships
- One attachment belongs to one `Idea`.

Validation Rules
- Only one attachment may be stored for each idea.
- File size must be capped at 10MB for local storage.
- Supported MIME types are restricted to PDF, PNG, JPG, JPEG, or DOCX.

### EvaluationComment
- `id: string` (UUID)
- `ideaId: string`
- `adminId: string`
- `commentText: string`
- `createdAt: DateTime`

Relationships
- One evaluation comment belongs to one idea.
- One evaluation comment belongs to one admin.

Validation Rules
- `commentText` is required when admins add feedback.

### Session
- `id: string` (UUID)
- `userId: string`
- `token: string`
- `expiresAt: DateTime`
- `createdAt: DateTime`

Relationships
- One session belongs to one `User`.

Validation Rules
- Session tokens are stored securely and tied to an HttpOnly cookie.
- `expiresAt` supports session expiration after a fixed window.

## State Transitions

- `submitted` → `under review`
- `under review` → `accepted`
- `under review` → `rejected`
- `submitted` → `accepted` or `rejected` may also be allowed if the admin chooses to skip review.

## Considerations

- `User` owns the submitter workflow and `admin` grants review permissions.
- `Attachment` metadata is stored separately from the file contents.
- `Session` persists active login state for the cookie/session auth flow.
