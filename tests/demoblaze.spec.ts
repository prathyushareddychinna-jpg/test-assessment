import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { AuthPage } from '../pages/auth.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { newUser, orderData } from '../test-data/credentials';

async function clearCart(page: import('@playwright/test').Page) {
  await page.goto('/cart.html');
  const deleteLinks = page.getByRole('link', { name: 'Delete', exact: true });
  while (await deleteLinks.count()) {
    await deleteLinks.first().click();
    await page.waitForTimeout(200);
  }
}

test.describe('DemoBlaze - critical functional journeys', () => {
  test('@smoke TC-01 browse category and open product details', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openCategory('Laptops');
    const productName = await home.openFirstProduct();
    expect(productName).toBeTruthy();
    await expect(page.getByRole('link', { name: 'Add to cart', exact: true })).toBeVisible();
  });

  test('@smoke TC-02 register a unique user and log in', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthPage(page);
    const user = newUser();

    await home.goto();
    const signUpMessage = await auth.signUp(user.username, user.password);
    expect(signUpMessage).toContain('Sign up successful');

    await auth.login(user.username, user.password);
    await expect(page.getByRole('link', { name: new RegExp(`Welcome ${user.username}`, 'i') })).toBeVisible();
  });

  test('@smoke TC-03 add a product to cart and verify the cart total', async ({ page }) => {
    await clearCart(page);
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.openCategory('Phones');
    const productName = await home.openFirstProduct();
    await product.addToCart();
    await cart.goto();
    await cart.expectProduct(productName);

    const total = await cart.getTotal();
    expect(total).toBeGreaterThan(0);
  });

  test('@smoke TC-04 complete a purchase and verify confirmation details', async ({ page }) => {
    await clearCart(page);
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.openCategory('Phones');
    await home.openFirstProduct();
    await product.addToCart();
    await cart.goto();
    const total = await cart.getTotal();
    expect(total).toBeGreaterThan(0);

    await cart.openPlaceOrder();
    await cart.purchase(orderData);

    await expect(page.getByText(orderData.name, { exact: true })).toBeVisible();
    await expect(page.getByText(String(total), { exact: false })).toBeVisible();
  });

  test('@bug TC-05 empty cart must not allow order completion', async ({ page }) => {
    await clearCart(page);
    const cart = new CartPage(page);
    await cart.goto();
    await expect(page.locator('#tbodyid tr')).toHaveCount(0);

    await cart.openPlaceOrder();
    await cart.purchase(orderData);

    // An empty cart should not produce a successful order.
    await expect(page.getByText('Thank you for your purchase!', { exact: true })).not.toBeVisible();
  });
});
