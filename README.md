# Engenious University - login tests

Playwright + TypeScript tests for the login flow on https://university.engenious.io/ (Chrome only).

- `test-cases.md` - manual P0 test cases (Task 1)
- `tests/login.spec.ts` - automated successful login (Task 2)
- `tests/login.negative.spec.ts` - automated negative scenarios (bonus)
- `tests/pages/LoginPage.ts` - page object

## Setup

Requires Node.js 18+ and Google Chrome.

```bash
npm install
```

Copy `.env.example` to `.env` and put in the email and password of a registered user:

```
VALID_EMAIL=you@example.com
VALID_PASSWORD=yourPassword
```

`.env` is ignored by Git - never commit real credentials.

## Run

```bash
npm test
```

```bash
npm run test:headed
```

```bash
npm run report
```

Note: `TC-LOGIN-002` makes one wrong-password attempt against the `VALID_EMAIL` account on every run.
