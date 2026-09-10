import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/tasks');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows login form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText(
      /invalid email or password/i,
    );
  });

  test('redirects to /dashboard/tasks after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('alice@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard/tasks');
  });

  test('shows register page with correct fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('shows conflict error for duplicate email on register', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill('Alice Smith');
    await page.getByLabel(/email/i).fill('existing@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText(/already registered/i);
  });
});
