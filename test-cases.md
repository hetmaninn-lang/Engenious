# Task 1: Manual QA - P0 Test Cases for the Login Flow

**Application:** Engenious University (https://university.engenious.io/)
**Scope:** Login flow (Sign In -> Log in -> credentials -> Login)
**Browser:** Chrome (latest)
**Test data:** one registered user (`VALID_EMAIL` / `VALID_PASSWORD`)

---

## TC-LOGIN-001: Successful login with valid credentials
| Field | Value |
|---|---|
| Priority | P0 |
| Type | Functional / Positive |
| Precondition | User is registered and not logged in |

| # | Step | Expected result |
|---|---|---|
| 1 | Open https://university.engenious.io/ | Landing page loads, "Sign In" button is visible |
| 2 | Click "Sign In" | Sign-in options are shown, "Log in" button is visible |
| 3 | Click "Log in" | Login form with Email and Password fields is displayed |
| 4 | Enter valid email and valid password | Values are accepted; password is masked |
| 5 | Click "Login" | User is authenticated and redirected to the dashboard / landing page |
| 6 | Check the dashboard | A logged-in-only element (e.g. profile/avatar, "Log out") is visible; "Sign In" is not shown |

---

## TC-LOGIN-002: Login with valid email and incorrect password
| Field | Value |
|---|---|
| Priority | P0 |
| Type | Negative / Security |
| Precondition | User is registered and not logged in |

| # | Step | Expected result |
|---|---|---|
| 1 | Open the login form (Sign In -> Log in) | Login form is displayed |
| 2 | Enter valid email and an incorrect password | Values are accepted |
| 3 | Click "Login" | Login is rejected; a clear error message is shown; user stays on the login page |
| 4 | Read the error message | It does not reveal whether the email or the password was wrong (no account enumeration) |
| 5 | Check the password field | Password is not shown in plain text and not pre-filled in a way that exposes it |

---

## TC-LOGIN-003: Login with unregistered email
| Field | Value |
|---|---|
| Priority | P0 |
| Type | Negative / Security |
| Precondition | Email used is not registered |

| # | Step | Expected result |
|---|---|---|
| 1 | Open the login form | Login form is displayed |
| 2 | Enter an unregistered email and any password | Values are accepted |
| 3 | Click "Login" | Login is rejected with the same generic error as TC-LOGIN-002; no session is created |

---

## TC-LOGIN-004: Required-field and input validation
| Field | Value |
|---|---|
| Priority | P0 |
| Type | Negative / Validation |
| Precondition | Login form is open |

| # | Step | Expected result |
|---|---|---|
| 1 | Leave Email and Password empty, click "Login" | Login is blocked; required-field validation is shown for both fields |
| 2 | Enter a password only, click "Login" | Login is blocked; Email validation message is shown |
| 3 | Enter an invalid email format (e.g. `user@`, `user.com`) with any password, click "Login" | Login is blocked; email-format validation is shown |
| 4 | Enter only spaces in both fields, click "Login" | Login is blocked; no server error or crash |

---

## TC-LOGIN-005: Security validation - injection input and protected page access
| Field | Value |
|---|---|
| Priority | P0 |
| Type | Security |
| Precondition | User is not logged in |

| # | Step | Expected result |
|---|---|---|
| 1 | Enter `' OR '1'='1` as email and as password, click "Login" | Login is rejected; no authentication bypass; no SQL/stack-trace error is shown |
| 2 | Enter `<script>alert(1)</script>` as email, any password, click "Login" | Input is treated as text; no script runs; login is rejected |
| 3 | While logged out, open a dashboard URL directly | User is redirected to the login page; protected content is not shown |
| 4 | Log in successfully, log out, then press the browser Back button | Protected content is not accessible; user is asked to log in again |

---

### Coverage summary
| Area | Test case |
|---|---|
| Successful login | TC-LOGIN-001 |
| Invalid credentials | TC-LOGIN-002, TC-LOGIN-003 |
| Input validation | TC-LOGIN-004 |
| Security | TC-LOGIN-002 (step 4-5), TC-LOGIN-003, TC-LOGIN-005 |
