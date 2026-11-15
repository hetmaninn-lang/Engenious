import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * Negative login scenarios (bonus, not required by the assessment).
 * They automate TC-LOGIN-002 .. TC-LOGIN-005 from test-cases.md.
 */

const validEmail = process.env.VALID_EMAIL;

// Never a real password: unique per run, so it cannot match the account's password.
const WRONG_PASSWORD = `Wrong-${Date.now()}!`;
const UNREGISTERED_EMAIL = `no.such.user.${Date.now()}@example.com`;
const GENERIC_ERROR = 'Invalid credentials!';

test.describe('Engenious University - login (negative)', () => {
  let loginPage: LoginPage;
  let loginRequests: string[];

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    loginRequests = loginPage.trackLoginRequests();
    await loginPage.gotoLoginForm();
  });

  test('TC-LOGIN-002: valid email with an incorrect password is rejected', async () => {
    test.skip(!validEmail, 'Set VALID_EMAIL in .env');

    await loginPage.fillCredentials(validEmail!, WRONG_PASSWORD);
    await loginPage.submit();

    // Generic message: does not say whether the email or the password was wrong
    await expect(loginPage.invalidCredentialsAlert).toHaveText(GENERIC_ERROR);
    await loginPage.expectNotLoggedIn();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-LOGIN-003: unregistered email is rejected with the same generic error', async () => {
    await loginPage.fillCredentials(UNREGISTERED_EMAIL, WRONG_PASSWORD);
    await loginPage.submit();

    await expect(loginPage.invalidCredentialsAlert).toHaveText(GENERIC_ERROR);
    await loginPage.expectNotLoggedIn();
  });

  test('TC-LOGIN-004: empty form shows validation for both fields', async () => {
    await loginPage.submit();

    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
    await loginPage.expectNotLoggedIn();
    expect(loginRequests, 'no login request must be sent').toHaveLength(0);
  });

  test('TC-LOGIN-004: password without email shows email validation', async () => {
    await loginPage.passwordInput.fill(WRONG_PASSWORD);
    await loginPage.submit();

    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeHidden();
    await loginPage.expectNotLoggedIn();
    expect(loginRequests, 'no login request must be sent').toHaveLength(0);
  });

  test('TC-LOGIN-004: only spaces in both fields does not log in', async () => {
    await loginPage.fillCredentials('   ', '   ');
    await loginPage.submit();

    await expect(loginPage.emailError).toBeVisible();
    await loginPage.expectNotLoggedIn();
    expect(loginRequests, 'no login request must be sent').toHaveLength(0);
  });

  // Malformed emails are stopped by the browser's built-in validation of <input type="email">.
  const malformedEmails = [
    { label: 'TC-LOGIN-004: email without domain', value: 'user@' },
    { label: 'TC-LOGIN-004: email without @', value: 'user.com' },
    { label: 'TC-LOGIN-005: SQL injection string', value: `' OR '1'='1` },
    { label: 'TC-LOGIN-005: script tag', value: '<script>alert(1)</script>' },
  ];

  for (const { label, value } of malformedEmails) {
    test(`${label} is blocked before submit`, async ({ page }) => {
      let dialogs = 0;
      page.on('dialog', async (dialog) => {
        dialogs++;
        await dialog.dismiss();
      });

      await loginPage.fillCredentials(value, WRONG_PASSWORD);
      await loginPage.submit();

      const isValid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid, 'browser must flag the email as invalid').toBe(false);
      await expect(loginPage.emailInput).toHaveValue(value); // kept as plain text
      await loginPage.expectNotLoggedIn();
      expect(loginRequests, 'no login request must be sent').toHaveLength(0);
      expect(dialogs, 'no script dialog must appear').toBe(0);
    });
  }
});
