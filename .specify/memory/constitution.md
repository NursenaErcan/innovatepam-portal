<!--
Sync Impact Report
Version change: unset → 1.0.0
Modified principles: placeholders → Clean Code; placeholders → Simple Responsive UI; placeholders → Minimal Dependencies; placeholders → Reusable React Components; placeholders → Persistence and Accessibility
Added sections: Technology & Constraints; Development Workflow
Removed sections: none
Templates requiring updates: none
Follow-up TODOs: none
-->

# InnovatePAM Portal Constitution

## Core Principles

### I. Clean Code
- Code MUST be readable, explicit, and easy to understand for the next developer.
- The project MUST use TypeScript strict mode and MUST avoid `any` except when a documented exception is required.
- Functions and components MUST have a single responsibility and MUST not hide side effects.
- Duplicate logic MUST be extracted into reusable utilities, hooks, or shared components.
- Comments MUST explain intent or trade-offs, not restate obvious implementation details.

### II. Simple Responsive UI
- The UI MUST be mobile-first and MUST work across viewport sizes without horizontal overflow.
- Layouts MUST remain simple, predictable, and visually consistent across screens.
- New UI behavior MUST be justified by user value and not added for visual novelty.
- Interactions MUST remain clear and accessible, with visible feedback for focus, hover, and disabled states.

### III. Minimal Dependencies
- Dependencies MUST be limited to essential, actively maintained packages.
- Tailwind CSS and shadcn/ui are approved; additional dependencies MUST be approved and justified.
- Native browser APIs and built-in React patterns MUST be preferred over extra libraries for one-off behavior.
- The bundle SHOULD remain small and maintainable, avoiding large frameworks for narrow needs.

### IV. Reusable React Components
- React components MUST be composable, presentational where possible, and configurable through props.
- UI components MUST separate visual rendering from business logic and data fetching.
- Shared components SHOULD be reused consistently rather than duplicated across pages.
- Components MUST be documented with clear intent and accessibility expectations.

### V. Persistence and Accessibility
- Persistence MUST use SQLite for local or server-side storage, with data access encapsulated behind a clear abstraction layer.
- Accessibility basics MUST be respected: semantic HTML, keyboard navigation, visible focus, and adequate contrast.
- Manual testing is acceptable for UI and responsive validation, but all findings MUST be documented and fixed before merge.
- The product MUST support basic assistive technology use cases and degrade gracefully when features are unavailable.

## Technology & Constraints
- The project MUST be implemented in TypeScript with strict compiler settings enabled.
- Tailwind CSS and shadcn/ui are the approved UI styling approach.
- SQLite is the required persistence technology; storage access MUST be isolated from UI components.
- The repository MUST avoid unnecessary dependency growth; every package addition MUST provide clear value for maintenance and performance.

## Development Workflow
- Every pull request MUST include a short compliance note explaining how the change follows these principles.
- Code reviews MUST verify TypeScript strictness, dependency additions, and adherence to responsive UI and accessibility basics.
- Manual testing MUST include at least one responsive viewport check and one keyboard/navigation check for UI flows.
- Non-trivial dependency or architecture changes MUST be documented and reviewed before merging.

## Governance
- This constitution is the authoritative guide for engineering decisions in the InnovatePAM Portal.
- Amendments require a documented rationale, review by the team, and an update to the `Last Amended` date.
- Version changes follow SemVer:
  - MAJOR for backward-incompatible principle or constraint changes.
  - MINOR for added principles or workflow expansions.
  - PATCH for clarifications, wording improvements, or non-semantic refinements.
- Reviewers MUST confirm at least one relevant principle in every PR and MUST flag violations before approval.

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13
