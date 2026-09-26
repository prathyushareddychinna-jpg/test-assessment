import { expect, Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectProduct(productName: string) {
    await expect(this.page.getByText(productName, { exact: true })).toBeVisible();
  }

  async getTotal() {
    const total = this.page.locator('#totalp');
    await expect(total).not.toHaveText('');
    return Number((await total.innerText()).trim());
  }

  async openPlaceOrder() {
    await this.page.getByRole('button', { name: 'Place Order', exact: true }).click();
    await expect(this.page.locator('#orderModal')).toBeVisible();
  }

  async purchase(data: { name: string; country: string; city: string; card: string; month: string; year: string }) {
    await this.page.locator('#name').fill(data.name);
    await this.page.locator('#country').fill(data.country);
    await this.page.locator('#city').fill(data.city);
    await this.page.locator('#card').fill(data.card);
    await this.page.locator('#month').fill(data.month);
    await this.page.locator('#year').fill(data.year);

    await this.page.getByRole('button', { name: 'Purchase', exact: true }).click();
    await expect(this.page.getByText('Thank you for your purchase!', { exact: true })).toBeVisible();
  }
}
