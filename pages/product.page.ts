import { expect, Page } from '@playwright/test';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async addToCart() {
    const dialog = this.page.waitForEvent('dialog');
    await this.page.getByRole('link', { name: 'Add to cart', exact: true }).click();
    const alert = await dialog;
    const message = alert.message();
    await alert.accept();
    expect(message).toContain('Product added');
  }
}
