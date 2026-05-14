# Quickstart: Smart Submission Forms (Phase 2)

## Prerequisites
- Phase 1 setup completed and application running locally.
- Seeded admin account available.

## Implementation Setup

1. Ensure dependencies are installed:

```bash
npm install
```

2. Ensure database is up to date:

```bash
npm run db:migrate -- --name smart-submission-forms
npm run db:generate
```

3. Start the app:

```bash
npm run dev
```

## Manual Validation Scenarios

### Submitter dynamic form behavior
- Login as submitter.
- Open idea submission page.
- Change category and verify field set updates:
- Technical Innovation: architecture impact, technology stack, implementation complexity.
- Process Improvement: current process, proposed improvement, estimated time savings.
- Client Solution: client problem, business impact, target industry.

### Dynamic validation behavior
- Submit missing required dynamic fields and verify field-level errors.
- For Process Improvement, test invalid estimated time savings values:
- non-numeric
- decimal
- zero
- negative
- Verify only positive integer hours are accepted.
- For Technical Innovation, verify implementation complexity only accepts low, medium, high.
- For category Other, verify submission still succeeds with empty `customFields` payload.

### Regression validation (Phase 1 compatibility)
- Register/login/logout still works.
- Core attachment rules still work.
- Submitter idea list still works.
- Admin review, status updates, and comments still work.
- Admin can see dynamic fields with category-aware labels.

## Final Validation Log
- `npm run lint`: pass
- `npm run build`: pass
- `npm run db:generate`: pass

## Expected Outcome
- Category-driven form behavior and validation are functional.
- Existing Phase 1 functionality remains operational.
