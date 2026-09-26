import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/index.html');
    await expect(this.page).toHaveTitle(/STORE/i);
  }

  async openCategory(category: 'Phones' | 'Laptops' | 'Monitors') {
    await this.page.getByRole('link', { name: category, exact: true }).click();
    await expect(this.page.locator('.card-title').first()).toBeVisible();
  }

  async openFirstProduct() {
    const product = this.page.locator('.card-title a').first();
    await expect(product).toBeVisible();
    const name = (await product.innerText()).trim();
    await product.click();
    await expect(this.page.getByRole('link', { name: 'Add to cart', exact: true })).toBeVisible();
    return name;
  }
}
