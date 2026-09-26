# Senior Test Engineer Assessment – Test Plan

## 1. Objective

Demonstrate a focused functional testing and automation approach for the DemoBlaze e-commerce website. The assessment prioritises test planning, automation design, risk-based thinking and clear communication rather than maximum test volume.

## 2. Scope

### In scope
- Product catalogue and category navigation
- Product details
- User registration and login
- Shopping cart
- Order placement / checkout
- Validation of important negative paths discovered during exploratory testing

### Out of scope for this time-boxed assessment
- Full accessibility audit
- Full performance/load testing
- Security penetration testing
- Exhaustive browser/device matrix
- API/database testing where the implementation is not required to demonstrate the requested UI functionality

These are recommended follow-up activities rather than evidence that they are unnecessary.

## 3. Functional testing priorities

1. **Critical business journeys** – browse product → add to cart → checkout.
2. **Authentication** – registration and login because they establish user identity and access to account functionality.
3. **Cart integrity** – selected product and total must be correct before payment.
4. **Negative validation** – invalid/empty states should not result in an apparently successful transaction.
5. **Navigation and product discovery** – category links and product details should be usable.

## 4. Test approach

A risk-based, layered approach is used:

- **Smoke tests:** prove the core application is reachable and the primary journey is functional.
- **Functional tests:** verify individual behaviours and business rules.
- **Negative tests:** deliberately exercise invalid states and boundary conditions.
- **Exploratory testing:** look for inconsistencies not obvious from the happy path, particularly around cart and checkout validation.
- **Regression automation:** automate stable, repeatable, business-critical journeys that are valuable to rerun.

The suite is deliberately limited to five automated cases because the assessment asks for a focused demonstration. Manual exploratory coverage remains important for areas where automation adds less value, such as visual consistency and broad usability exploration.

## 5. Automation technology

### Selected: Playwright + TypeScript

Reasons:
- Built-in browser automation and test runner in one package.
- Automatic waiting reduces synchronisation code and common UI-test flakiness.
- Strong locator APIs based on user-facing roles/text, improving maintainability.
- Built-in screenshots, video and traces for failure diagnosis.
- Easy local and CI execution.
- Straightforward cross-browser expansion if required.
- TypeScript provides compile-time checks while remaining concise for a small assessment.

### Supporting tools
- Git/GitHub for version control and assessor access.
- GitHub Actions for repeatable CI execution.
- Playwright HTML report for execution evidence.

## 6. Automation design principles

- Keep test cases independent where practical.
- Generate unique registration data rather than sharing a permanent test account.
- Avoid arbitrary sleeps except for controlled cleanup where the application has no deterministic state signal.
- Prefer semantic locators and stable IDs where available.
- Capture trace/screenshot/video only when needed, primarily on failures.
- Keep page interaction code separate from test intent.
- Treat a reproducible defect as useful test evidence rather than hiding a failing test.

## 7. Risks and limitations

DemoBlaze is a public demonstration site, so tests may be affected by external availability, shared state and application-side inconsistencies. The suite should therefore be interpreted as functional evidence for the assessment, not as a production-grade release gate for a real commerce platform.
