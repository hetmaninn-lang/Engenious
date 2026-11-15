import { expect, Locator, Page } from '@playwright/test';

/**
 * Page object for the Engenious University login flow.
 *
 * Real flow (recorded from the site):
 *   Landing page -> "Sign Up / Login" button -> /registration (tabs: Registration | Login)
 *   -> "Login" tab -> /login (Email, Password, "Login" button)
 *   -> redirect to landing page (cookie banner shows up) -> logged-in header with menu button
 *   -> menu drawer contains the user name and a "Logout" button.
 */
export class LoginPage {
  readonly page: Page;
  readonly cookieEssentialButton: Locator;
  readonly signUpLoginButton: Locator;
  readonly loginTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly invalidCredentialsAlert: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly menuButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Cookie consent dialog ("We value your privacy")
    this.cookieEssentialButton = page
      .getByRole('button', { name: /essential only/i })
      .or(page.getByText(/^\s*essential only\s*$/i))
      .first();

    // Landing page header button (logged-out state): <button>Sign Up / Login</button>
    this.signUpLoginButton = page.getByRole('button', { name: /sign up\s*\/\s*login/i });

    // "Login" tab on /registration is a link: <a href="/login">Login</a>
    this.loginTab = page.getByRole('link', { name: /^\s*login\s*$/i });

    // Login form: <input type="email" name="email">, <input type="password" name="password">
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');

    // Submit button: <button type="submit">Login</button>
    this.submitButton = page.locator('button[type="submit"]');

    // Error toast shown when the site rejects the email/password
    this.invalidCredentialsAlert = page.getByRole('alert').filter({ hasText: /invalid credentials/i });

    // Inline validation messages under the fields
    this.emailError = page.getByText('Invalid email address', { exact: true });
    this.passwordError = page.getByText('Password is required', { exact: true });

    // Logged-in header: burger button with aria-label="open drawer"
    this.menuButton = page.getByRole('button', { name: /open drawer/i });

    // Inside the menu drawer
    this.logoutButton = page.getByRole('button', { name: /^\s*log\s?out\s*$/i }).first();
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.dismissCookies(3_000);
  }

  /** Closes the cookie banner if it appears (it shows on the landing page, also after login). */
  async dismissCookies(timeout = 10_000): Promise<void> {
    try {
      await this.cookieEssentialButton.waitFor({ state: 'visible', timeout });
      await this.cookieEssentialButton.click();
      await this.cookieEssentialButton.waitFor({ state: 'hidden', timeout: 10_000 });
    } catch {
      // banner not shown - continue
    }
  }

  /** Landing page -> /registration -> Login tab -> /login */
  async openLoginForm(): Promise<void> {
    await this.signUpLoginButton.click();
    await this.page.waitForURL(/\/registration/);
    await this.loginTab.click();
    await this.page.waitForURL(/\/login/);
  }

  /** Opens /login directly (used by the negative tests) and closes the cookie dialog that covers the form. */
  async gotoLoginForm(): Promise<void> {
    await this.page.goto('/login');
    await this.dismissCookies();
    await expect(this.emailInput).toBeVisible();
  }

  /** Collects login submissions (POST /login) so a test can assert that none was sent. */
  trackLoginRequests(): string[] {
    const sent: string[] = [];
    this.page.on('request', (request) => {
      if (request.method() === 'POST' && new URL(request.url()).pathname === '/login') {
        sent.push(request.url());
      }
    });
    return sent;
  }

  /** Rejected login = still on /login with the form shown, and no logged-in menu. */
  async expectNotLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.submitButton).toBeVisible();
    await expect(this.menuButton).toBeHidden();
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.openLoginForm();
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /** Logged in = left the /login page, no "Sign Up / Login" button, and the menu drawer shows "Logout". */
  async expectLoggedIn(): Promise<void> {
    // Either we get redirected away from /login, or the site shows an "Invalid credentials!" toast.
    // Fail fast with a clear message instead of waiting for the whole test timeout.
    const outcome = await Promise.race([
      this.page
        .waitForURL((url) => !/\/(login|registration)/.test(url.pathname), { timeout: 30_000 })
        .then(() => 'redirected' as const)
        .catch(() => 'timeout' as const),
      this.invalidCredentialsAlert
        .waitFor({ state: 'visible', timeout: 30_000 })
        .then(() => 'rejected' as const)
        .catch(() => 'timeout' as const),
    ]);
    if (outcome === 'rejected') {
      throw new Error(
        'The site answered "Invalid credentials!" - check VALID_EMAIL / VALID_PASSWORD in .env',
      );
    }
    expect(outcome, 'No redirect after clicking "Login" within 30s').toBe('redirected');
    await this.dismissCookies();
    await expect(this.signUpLoginButton).toBeHidden();
    await this.menuButton.click();
    await expect(this.logoutButton).toBeVisible();
  }
}
