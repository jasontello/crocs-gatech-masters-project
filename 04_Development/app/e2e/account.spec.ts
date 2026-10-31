import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('account sign in is optional and browser inventory stays available', async ({ page }) => {
  await page.goto('?prototype&skipIntro');
  await page.getByRole('button', { name: 'Sign in to save across devices' }).click();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeDisabled();
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await page.getByRole('button', { name: 'Close sign in' }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Scan groceries', exact: true })).toBeVisible();
});
