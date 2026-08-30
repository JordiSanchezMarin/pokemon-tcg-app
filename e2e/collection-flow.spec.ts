import { expect, test } from '@playwright/test';

test('searches for a card, adds it, and persists the collection', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/search?set=base1');

  await expect(page.locator('.set-selector-value')).toHaveText('Base Set');
  await page.getByPlaceholder('Nombre del Pokémon').fill('Gyarados');
  await page.getByPlaceholder('Número (Local ID)').fill('6');
  await expect(page).toHaveURL(/set=base1.*name=Gyarados.*number=6/);
  await expect(page.getByRole('button', { name: 'Anterior' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Siguiente' })).toHaveCount(2);

  const card = page.locator('.pokemon-card-wrapper').filter({ hasText: 'Gyarados' }).first();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Añadir a la colección' }).click();
  await page.getByRole('button', { name: 'Añadir Carta' }).press('Enter');
  await expect(card.locator('.count-display')).toHaveText('1');

  await page.getByRole('link', { name: 'Mi Colección' }).click();
  await page.locator('.set-name[title="Base Set"]').click();
  await page.locator('.set-card-item').filter({ hasText: 'Gyarados' }).click();
  await expect(page).toHaveURL(/\/card\/base1-6$/);
  await expect(page.getByRole('heading', { name: 'Gyarados' })).toBeVisible();

  await page.getByRole('link', { name: 'Mi Colección' }).click();
  await page.getByRole('button', { name: 'Resumen' }).click();
  await expect(page.getByRole('heading', { name: 'Gyarados' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Resumen' }).click();
  await expect(page.getByRole('heading', { name: 'Gyarados' })).toBeVisible();
});