# Companies House – Senior Test Engineer Assessment

Functional test planning and browser automation assessment for DemoBlaze.

## Application under test

https://www.demoblaze.com/index.html

## Approach

This submission uses a focused, risk-based approach and five automated tests covering:

1. Product/category navigation
2. Registration and login
3. Add to cart and total validation
4. End-to-end checkout
5. Empty-cart checkout behaviour

The suite is intentionally small and focused on high-value, repeatable functional coverage.

## Technology

- Playwright Test
- TypeScript
- Node.js
- Git/GitHub
- GitHub Actions

## Project structure

```text
.
├── docs/
│   ├── test-plan.md
│   ├── test-cases.md
│   └── issues.md
├── pages/
│   ├── auth.page.ts
│   ├── cart.page.ts
│   ├── home.page.ts
│   └── product.page.ts
├── test-data/
│   └── credentials.ts
├── tests/
│   └── demoblaze.spec.ts
├── .github/workflows/playwright.yml
├── playwright.config.ts
└── package.json
```

## Prerequisites - Windows

Install:

- Node.js 20 or later
- Git
- Visual Studio Code (recommended)

Verify Node.js and npm:

```powershell
node --version
npm --version
```

## Install

From PowerShell or Command Prompt, in the project folder:

```powershell
npm install
npx playwright install chromium
```

## Run the tests

Run the full suite:

```powershell
npm test
```

Run smoke tests:

```powershell
npm run test:smoke
```

Run in a visible browser:

```powershell
npm run test:headed
```

Run with the Playwright inspector:

```powershell
npm run test:debug
```

Open the HTML report after a run:

```powershell
npm run test:report
```

## Useful Windows commands

Run a single test file:

```powershell
npx playwright test tests/demoblaze.spec.ts
```

Run a single test by title:

```powershell
npx playwright test -g "TC-03"
```

## CI

GitHub Actions runs the test suite on pushes and pull requests. The Playwright HTML report is uploaded as a workflow artifact.

## Test execution dashboard

After a run, `npm run test:report` opens a custom execution dashboard. It shows the five selected scenarios, their selection rationale, expected result, observed outcome, status, duration, and investigation guidance for failures.

The dashboard is generated from the Playwright results and is not manually populated.

## Test evidence

The Playwright configuration retains trace, screenshot and video evidence for failed tests. These artefacts can be used to support defect investigation and reporting.

## Notes

The test site is a public demonstration application. Results may be affected by external availability and application-side state. Defects should only be reported as confirmed after local reproduction and evidence capture.
