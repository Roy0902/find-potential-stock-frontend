import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { waitForHydration } from '../utils/hydration.js';

/**
 * Writes the owner login storage state used by admin tests:
 *   playwright/.auth/owner.json
 *
 * Requires the app to be running (see .env: URL) and the owner account to exist.
 * API tests set `test.use({ storageState: 'playwright/.auth/owner.json' })`;
 * the skills expect this file to be produced by this script.
 */
const baseURL = process.env.URL ?? 'http://localhost:5173';
const username = process.env.ADMIN_USERNAME ?? 'owner';
const password = process.env.ADMIN_PASSWORD ?? 'change-me';
const outputPath = fileURLToPath(new URL('../../playwright/.auth/owner.json', import.meta.url));

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${baseURL}/admin/login`);
    await waitForHydration(page);
    await page.getByRole('textbox', { name: /username|email|帳號/i }).fill(username);
    await page.getByLabel(/password|密碼/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in|登入/i }).click();

    await page.waitForURL(/\/admin(\/|$)/, { timeout: 30_000 });

    await mkdir(fileURLToPath(new URL('../../playwright/.auth/', import.meta.url)), {
      recursive: true,
    });
    await context.storageState({ path: outputPath });
    console.log(`wrote ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
