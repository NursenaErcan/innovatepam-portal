# ADR-002: Authentication Strategy

- Status: Accepted
- Date: 2026-05-14
- Context: InnovatEPAM Portal MVP (local-first, role-based submitter/admin workflow)

## Decision
The MVP uses cookie/session authentication with server-side session records in SQLite and password hashing via bcrypt.

Specifically:
- Login creates an opaque session token.
- Session token is stored in an HttpOnly cookie.
- Session metadata (user, token, expiration) is persisted in the Session table.
- Passwords are hashed with bcrypt before storage.

## Why Cookie/Session Authentication Was Selected
Cookie/session auth was selected because it matches the MVP requirement and keeps control of authentication state on the server. This model is straightforward for role-based route protection and session invalidation.

It also simplifies logout semantics: deleting server-side session records immediately revokes access without additional token revocation mechanisms.

## Why bcrypt Was Selected
bcrypt was selected as a proven password hashing algorithm with salting and computational cost controls. It is widely used, well-understood, and suitable for this MVP's local deployment profile.

It provides a clear improvement over plain hashes and supports secure password verification without storing raw passwords.

## Why External Auth Providers Were Avoided
External auth providers (SSO/OAuth) were intentionally avoided for MVP scope control and local setup simplicity.

Reasons:
- The MVP runs locally and is intended for fast functional validation.
- External providers add integration overhead, credential setup, callback routing, and environment complexity.
- The current product goals do not require federated identity yet.

## MVP Simplicity Considerations
The chosen auth approach minimizes moving parts while preserving core security behavior.

Simplicity benefits:
- No dependency on third-party identity infrastructure.
- Clear end-to-end flow in one codebase (register, login, session creation, route checks, logout).
- Easy local reproducibility for demos and manual validation.
- Lower operational burden for initial delivery.

## Security Considerations
### Implemented MVP Controls
- Passwords are hashed with bcrypt before persistence.
- Session cookie is HttpOnly to reduce client-side script exposure.
- SameSite=Lax is used for local-session behavior.
- Session expiration is enforced server-side.
- Server-side role checks protect submitter/admin routes and APIs.
- Logout removes server-side session records.

### Known MVP Limitations
- No CSRF token mechanism yet.
- No login rate limiting or account lockout policy.
- Session hardening can be expanded (rotation strategy, anomaly detection).
- No enterprise SSO, MFA, or centralized identity governance.

### Planned Hardening Direction
- Add middleware-centric auth enforcement.
- Add CSRF protection for state-changing actions.
- Add rate limiting and brute-force mitigation on login endpoints.
- Add stronger session lifecycle controls and audit logging.

## Tradeoffs
### Pros
- Fast to implement and validate locally.
- Easy to reason about for role-based access control.
- Predictable invalidation and logout behavior.

### Cons
- More custom auth responsibility in application code.
- Security hardening tasks remain for post-MVP phases.
- Less immediately scalable than managed identity solutions for enterprise rollout.

## Consequences
### Positive Consequences
- Delivered a complete local auth flow aligned to product requirements.
- Reduced MVP delivery risk by avoiding external integration dependencies.
- Kept authentication logic transparent and debuggable.

### Negative Consequences
- Future production readiness requires additional security controls.
- Migration to enterprise identity standards may require refactoring.
- Ongoing security maintenance burden remains with the application team.
