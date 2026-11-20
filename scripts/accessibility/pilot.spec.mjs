import { expect, test } from '@playwright/test';
import { measure } from './audit.mjs';

const start = '/sandbox/people';
const seedCells = {
  People: 'sandbox-person-01@example.test',
  Equipment: 'SBX-EQ-0056',
  Access: 'Building card access',
  Keys: 'SBX-K-02',
  Spaces: '100 North Research Hall'
};
const teamAssets = page => page.getByRole('navigation', { name: 'Team assets' });
const assetLinks = page => teamAssets(page).getByRole('link').evaluateAll(links =>
  links.map(link => ({ name: link.textContent.trim(), href: link.href }))
);

async function signIn(page, report) {
  await page.context().route('https://www.googletagmanager.com/**', route => route.abort());
  await page.goto('/login?returnUrl=' + start);
  await page.getByRole('textbox', { name: 'Kerberos ID or email' }).fill('sandbox-admin');
  await page.getByRole('button', { name: 'Sign in locally' }).click();
  await expect(page).toHaveURL(new URL(start, process.env.PILOT_URL).href);
  await expect(teamAssets(page)).toBeVisible();
  report.role = await page.evaluate(() => window.App?.permissionsData ?? null);
  expect(report.role).toEqual(expect.arrayContaining(['Admin', 'DepartmentalAdmin']));
}

async function openAsset(page, links, name) {
  const destinations = links.filter(link => link.name === name).map(link => link.href);
  const expected = new URL('/sandbox/' + name.toLowerCase(), process.env.PILOT_URL).href;
  expect(destinations, `Missing ${name} link to ${expected} in Team assets`).toContain(expected);
  if (name !== 'People') await page.goto(expected);
  expect(page.url(), `Redirect from ${expected}`).toBe(expected);
  await expect(page.getByRole('cell', { name: seedCells[name], exact: true })).toBeVisible();
}

test('crawl Team assets', async ({ page }) => {
  await measure(page, 'crawl', Object.keys(seedCells), async ({ scan, report }) => {
    await scan('People', async () => {
      await signIn(page, report);
      report.links = await assetLinks(page);
      await openAsset(page, report.links, 'People');
    });
    if (!report.links) return;
    for (const name of Object.keys(seedCells).filter(name => name !== 'People')) {
      await scan(name, () => openAsset(page, report.links, name));
    }
  });
});

test('assign equipment with the keyboard', async ({ page }) => {
  const initial = 'Assign Equipment';
  const selected = 'Assign Equipment with expiration date';
  await measure(page, 'assignment', [initial, selected], async ({ scan, report }) => {
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: seedCells.Equipment, exact: true }) });
    const opener = row.getByRole('button', { name: 'Row actions' });
    const dialog = page.getByRole('dialog', { name: initial });
    const person = dialog.getByRole('combobox', { name: 'Assign To' });
    const date = dialog.getByRole('group', { name: 'Set the expiration date' });
    const scope = '[role="dialog"]';

    const opened = await scan(initial, async settleRequests => {
      await signIn(page, report);
      const links = await assetLinks(page);
      await openAsset(page, links, 'People');
      await settleRequests();
      await openAsset(page, links, 'Equipment');
      await settleRequests();
      await row.getByRole('link', { name: 'Details' }).press('Tab');
      await expect(opener).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('menuitem', { name: 'Assign', exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(person).toBeVisible();
      await expect(dialog.getByText('Brio Webcam - 56', { exact: true })).toBeVisible();
      await expect(date).toHaveCount(0);
    }, scope);
    if (!opened) return;
    // Capture focus before fill() moves it to the person search.
    report.focusAfterOpening = await dialog.evaluate(element => ({
      insideDialog: element.contains(document.activeElement),
      tag: document.activeElement.tagName,
      label: document.activeElement.getAttribute('aria-label')
    }));

    await scan(selected, async () => {
      await person.fill('Maya');
      await expect(dialog.getByRole('option', { name: /Maya Chen.*sandbox-person-01@example.test/ })).toBeVisible();
      await person.press('ArrowDown');
      await person.press('Enter');
      await expect(person).toHaveValue('Maya Chen (sandbox-person-01@example.test)');
      for (const name of ['Month', 'Day', 'Year']) await expect(date.getByRole('spinbutton', { name })).toBeVisible();
      await expect(date.getByRole('button', { name: 'Toggle calendar' })).toBeVisible();
    }, scope);

    // Escape invokes the app's discard confirmation. The Assign menu item unmounts
    // when chosen, so focus should return to this equipment row's actions button.
    let discardPrompt;
    page.once('dialog', async prompt => {
      discardPrompt = prompt.message();
      if (prompt.type() === 'confirm' && discardPrompt === 'Please confirm you want to close!') await prompt.accept();
      else await prompt.dismiss();
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(discardPrompt).toBe('Please confirm you want to close!');
    await expect(page).toHaveURL(new URL('/sandbox/equipment', process.env.PILOT_URL).href);
    const focusReturned = await expect(opener).toBeFocused({ timeout: 2000 }).then(() => true, () => false);
    report.focus = {
      expected: seedCells.Equipment + ' Row actions',
      returned: focusReturned,
      observed: await page.evaluate(() => ({
        tag: document.activeElement.tagName,
        label: document.activeElement.getAttribute('aria-label')
      }))
    };
    console.log('Focus returned to row actions:', focusReturned);
  });
});
