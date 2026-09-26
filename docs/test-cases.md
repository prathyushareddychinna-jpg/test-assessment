# Automated Test Cases

## Test selection rationale

The five automated scenarios were selected to provide a focused functional slice rather than broad but shallow coverage. Together they cover:

- Product discovery and navigation
- Authentication
- Cart state and calculation
- The highest-value end-to-end purchase journey
- A negative business-rule scenario

This gives the assessment evidence across both happy-path and negative-path behaviour while keeping the suite small enough to maintain and execute quickly.

| ID | Scenario | Expected result | Why automate? | Coverage role |
|---|---|---|---|---|
| TC-01 | Open Laptops category and open the first product | Category loads and product details expose Add to cart | Stable smoke coverage for catalogue navigation | Product discovery |
| TC-02 | Register a unique user and log in | Registration succeeds and the authenticated user is shown | Authentication is repeatable and business-critical | Authentication |
| TC-03 | Add a product to cart | Product appears in cart and total is greater than zero | Core purchase journey and cart regression | Cart / transaction state |
| TC-04 | Place an order for a carted product | Purchase confirmation is shown and customer/amount details are present | High-value end-to-end business journey | End-to-end purchase |
| TC-05 | Attempt to place an order with an empty cart | System must prevent successful order completion | Negative regression test for a business-rule defect | Negative / business rule |

## TC-01 – Browse category and product

**Objective:** Validate the basic product-discovery journey.

**Preconditions:** Application is available.

**Steps:**
1. Open the home page.
2. Select Laptops.
3. Open the first displayed product.

**Expected:** The category displays products and the product detail page exposes Add to cart.

**Automation value:** A fast smoke test that detects catalogue/navigation breakage.

## TC-02 – Registration and login

**Objective:** Validate registration followed by authentication with the same credentials.

**Preconditions:** Generated username has not previously been registered.

**Steps:**
1. Open Sign up.
2. Enter unique username/password.
3. Submit registration.
4. Open Log in.
5. Enter the same credentials.
6. Submit.

**Expected:** Registration succeeds and the logged-in username is displayed.

**Automation value:** Authentication is repetitive and must remain reliable across regression runs.

## TC-03 – Add product and verify total

**Objective:** Validate cart state and the resulting cart total.

**Steps:**
1. Ensure cart is empty.
2. Open Phones.
3. Open the first product.
4. Add it to cart.
5. Open Cart.

**Expected:** The selected product is present and cart total is greater than zero.

**Automation value:** Protects a core purchase flow and validates resulting state rather than only a click.

## TC-04 – Complete purchase

**Objective:** Validate the end-to-end purchase journey and confirmation details.

**Steps:**
1. Ensure cart is empty.
2. Add a product.
3. Open Cart and record displayed total.
4. Open Place Order.
5. Enter valid checkout information.
6. Purchase.

**Expected:** Confirmation is displayed with customer and order information, including the expected amount.

**Automation value:** High-value end-to-end coverage suitable for regression execution.

## TC-05 – Empty-cart purchase prevention

**Objective:** Validate the negative business rule that an empty cart must not result in a successful order.

**Steps:**
1. Ensure cart is empty.
2. Open Place Order.
3. Enter checkout information.
4. Attempt Purchase.

**Expected:** The application must not create a successful order when there are no products.

**Automation value:** Negative business-rule tests expose unsafe state transitions that a happy-path suite can miss. If the current site allows the purchase, the failing automation provides reproducible evidence for investigation.
