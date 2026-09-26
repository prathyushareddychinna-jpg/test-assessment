import { expect, Page } from '@playwright/test';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async signUp(username: string, password: string) {
    await this.page.getByRole('link', { name: 'Sign up', exact: true }).click();
    await expect(this.page.locator('#sign-username')).toBeVisible();
    await this.page.locator('#sign-username').fill(username);
    await this.page.locator('#sign-password').fill(password);

    const dialog = this.page.waitForEvent('dialog');
    await this.page.getByRole('button', { name: 'Sign up', exact: true }).click();
    const alert = await dialog;
    const message = alert.message();
    await alert.accept();
    return message;
  }

  async login(username: string, password: string) {
    await this.page.getByRole('link', { name: 'Log in', exact: true }).click();
    await expect(this.page.locator('#loginusername')).toBeVisible();
    await this.page.locator('#loginusername').fill(username);
    await this.page.locator('#loginpassword').fill(password);

    await this.page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(this.page.getByRole('link', { name: new RegExp(`Welcome ${username}`, 'i') })).toBeVisible();
  }
}
