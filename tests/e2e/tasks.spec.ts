import { test, expect, loginAsAlice } from './fixtures';

test.describe('Tasks page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test('shows the tasks page with heading and filters bar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible();
    await expect(page.getByLabel(/status/i)).toBeVisible();
    await expect(page.getByLabel(/priority/i)).toBeVisible();
  });

  test('shows new task button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });

  test('opens create task modal when New task is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /new task/i }).click();
    await expect(page.getByRole('dialog', { name: /create task/i })).toBeVisible();
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });

  test('closes modal when Escape is pressed', async ({ page }) => {
    await page.getByRole('button', { name: /new task/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('creates a task and shows it in the table', async ({ page }) => {
    await page.getByRole('button', { name: /new task/i }).click();
    await page.getByLabel(/title/i).fill('E2E Test Task');
    await page.getByLabel(/project/i).selectOption({ label: 'Website Redesign' });
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('E2E Test Task')).toBeVisible();
  });

  test('filters tasks by status', async ({ page }) => {
    await page.getByLabel(/status/i).selectOption('IN_PROGRESS');
    await expect(page.getByLabel(/status/i)).toHaveValue('IN_PROGRESS');
  });

  test('filters tasks by priority', async ({ page }) => {
    await page.getByLabel(/priority/i).selectOption('HIGH');
    await expect(page.getByLabel(/priority/i)).toHaveValue('HIGH');
  });

  test('resets filters when Reset button is clicked', async ({ page }) => {
    await page.getByLabel(/status/i).selectOption('DONE');
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByLabel(/status/i)).toHaveValue('');
  });

  test('shows task count summary', async ({ page }) => {
    await expect(page.getByText(/showing/i)).toBeVisible();
  });
});
