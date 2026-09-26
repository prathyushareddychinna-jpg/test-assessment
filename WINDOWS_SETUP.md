# Windows Setup

## 1. Check Node.js

Open PowerShell:

```powershell
node --version
npm --version
```

Node.js 20 or later is recommended.

## 2. Install project dependencies

From the project directory:

```powershell
npm install
npx playwright install chromium
```

## 3. Run the suite

```powershell
npm test
```

## 4. Run with the browser visible

```powershell
npm run test:headed
```

## 5. Open the report

```powershell
npm run test:report
```
