import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const email = process.env.VALID_EMAIL;
const password = process.env.VALID_PASSWORD;

test.describe('Engenious University - login', () => {
  test.skip(!email || !password, 'Set VALID_EMAIL and VALID_PASSWORD in .env');

  test('Automate the login process on Engenious University', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the site', async () => {
      await loginPage.open();
      await expect(loginPage.signUpLoginButton).toBeVisible();
    });

    await test.step('Click "Sign Up / Login", then the "Login" tab', async () => {
      await loginPage.openLoginForm();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    await test.step('Enter email and password', async () => {
      await loginPage.fillCredentials(email!, password!);
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    await test.step('Click "Login"', async () => {
      await loginPage.submit();
    });

    await test.step('Verify the user is logged in', async () => {
      await loginPage.expectLoggedIn();
    });
  });
});
