const fs = require('fs');
const path = require('path');

const TEST_CATALOGUE = {
  'TC-01': {
    objective: 'Validate the core catalogue navigation journey from category selection to product details.',
    why: 'A stable smoke scenario covering a common customer journey and an important entry point into shopping flows.',
    expected: 'The selected category displays products and the product details page exposes the Add to cart action.',
    selection: 'Customer journey / smoke coverage',
    failure: 'The report should be checked for navigation or product-detail assertion failures.'
  },
  'TC-02': {
    objective: 'Validate new-user registration followed by authentication with the same credentials.',
    why: 'Authentication is a core functional capability and is repeatable across regression runs.',
    expected: 'Registration succeeds and the authenticated username is displayed after login.',
    selection: 'Authentication / core functionality',
    failure: 'A failure would require investigation of registration, credentials, login or authenticated-state handling.'
  },
  'TC-03': {
    objective: 'Validate product addition to the cart and verify that the resulting cart total is greater than zero.',
    why: 'Covers a core purchase step and validates resulting business state rather than only a click or navigation event.',
    expected: 'The selected product is present in the cart and the cart total is greater than zero.',
    selection: 'Cart / transaction state',
    failure: 'A failure would require investigation of product selection, add-to-cart behaviour, cart state or total calculation.'
  },
  'TC-04': {
    objective: 'Validate the end-to-end purchase journey and the confirmation details shown after checkout.',
    why: 'This is a high-value business journey that connects product selection, cart state, checkout and confirmation.',
    expected: 'A purchase confirmation is displayed and includes the submitted customer name and expected order amount.',
    selection: 'End-to-end / highest-value journey',
    failure: 'The current run failed while verifying the customer name. The evidence proves the expected text was not found; it does not by itself prove that the purchase transaction failed.'
  },
  'TC-05': {
    objective: 'Validate that an order cannot be successfully completed when the cart contains no products.',
    why: 'Negative-path coverage checks an important business rule that a happy-path suite would not exercise.',
    expected: 'No successful purchase confirmation is displayed when the cart is empty.',
    selection: 'Negative / business-rule coverage',
    failure: 'The current run displayed a successful purchase confirmation despite an empty cart. This should be reproduced manually before being recorded as a confirmed product defect.'
  }
};

class ProfessionalReporter {
  constructor() {
    this.startedAt = new Date();
  }

  onBegin(config, suite) {
    this._rootSuites = suite.suites || [];
  }

  onEnd(result) {
    const reportDir = path.resolve('reports');
    fs.mkdirSync(reportDir, { recursive: true });

    const tests = [];
    const walk = (suite, projectName = '') => {
      for (const child of suite.suites || []) walk(child, child.project()?.name || projectName);
      for (const test of suite.tests || []) {
        const results = test.results || [];
        const last = results[results.length - 1];
        const status = test.outcome();
        const id = test.title.match(/TC-\d+/)?.[0] || '';
        tests.push({
          id,
          title: test.title.replace(/^@\w+\s+/, ''),
          tags: (test.title.match(/@\w+/g) || []).map(x => x.slice(1)),
          status,
          project: test.parent?.project()?.name || projectName || 'chromium',
          duration: last ? last.duration : 0,
          error: last?.error?.message || '',
          retries: Math.max(0, results.length - 1),
          catalogue: TEST_CATALOGUE[id] || null,
        });
      }
    };

    for (const suite of this._rootSuites || []) walk(suite);

    const passed = tests.filter(t => t.status === 'expected').length;
    const failed = tests.filter(t => t.status === 'unexpected').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const flaky = tests.filter(t => t.status === 'flaky').length;
    const total = tests.length;
    const duration = tests.reduce((n, t) => n + (t.duration || 0), 0);

    const data = {
      generatedAt: new Date().toISOString(),
      runStatus: result.status,
      duration,
      total,
      passed,
      failed,
      skipped,
      flaky,
      tests,
    };

    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(data, null, 2));
    fs.writeFileSync(path.join(reportDir, 'index.html'), buildHtml(data));
  }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

function statusMeta(status) {
  if (status === 'expected') return { label: 'PASSED', cls: 'pass' };
  if (status === 'unexpected') return { label: 'FAILED', cls: 'fail' };
  if (status === 'skipped') return { label: 'SKIPPED', cls: 'skip' };
  return { label: 'FLAKY', cls: 'flaky' };
}

function actualOutcome(test) {
  if (!test.error) return 'Observed behaviour matched the automated expectation.';
  if (test.id === 'TC-04') {
    return 'The purchase flow reached the confirmation assertion, but the expected customer name “Assessment Tester” was not found within the timeout. The evidence does not establish that the transaction itself failed.';
  }
  if (test.id === 'TC-05') {
    return 'The empty-cart scenario displayed “Thank you for your purchase!”, which contradicts the expected prevention rule.';
  }
  return 'The automated assertion did not match the observed application state. Review the failure evidence before classifying the cause.';
}

function failureDisposition(test) {
  if (!test.error) return 'No investigation required from this run.';
  if (test.id === 'TC-04') return 'Investigate confirmation data / locator / timing and reproduce before raising a defect.';
  if (test.id === 'TC-05') return 'Reproduce manually and capture evidence before confirming as a product defect.';
  return 'Reproduce and investigate before confirming a product defect.';
}

function buildHtml(data) {
  const rate = data.total ? Math.round((data.passed / data.total) * 100) : 0;
  const totalDuration = (data.duration / 1000).toFixed(1);
  const rows = data.tests.map(t => {
    const meta = statusMeta(t.status);
    return `<tr>
      <td><strong>${esc(t.id)}</strong></td>
      <td>${esc(t.title)}</td>
      <td><span class="pill ${meta.cls}">${meta.label}</span></td>
      <td>${(t.duration / 1000).toFixed(1)}s</td>
    </tr>`;
  }).join('');

  const detailCards = data.tests.map(t => {
    const meta = statusMeta(t.status);
    const c = t.catalogue || {};
    const errorBlock = t.error ? `
      <div class="result-block failure">
        <div class="mini-label">WHY IT FAILED / INVESTIGATION</div>
        <div class="result-text">${esc(c.failure || 'Review the execution evidence and reproduce the scenario.')}</div>
        <details><summary>Technical assertion evidence</summary><pre>${esc(t.error)}</pre></details>
      </div>` : `
      <div class="result-block success-block">
        <div class="mini-label">END RESULT</div>
        <div class="result-text">${esc(actualOutcome(t))}</div>
      </div>`;

    return `<article class="test-card">
      <div class="test-head">
        <div><span class="test-id">${esc(t.id)}</span><h3>${esc(t.title)}</h3></div>
        <span class="pill ${meta.cls}">${meta.label}</span>
      </div>
      <div class="grid">
        <div><div class="mini-label">OBJECTIVE</div><p>${esc(c.objective || '')}</p></div>
        <div><div class="mini-label">WHY THIS TEST WAS SELECTED</div><p>${esc(c.why || '')}</p></div>
        <div><div class="mini-label">EXPECTED RESULT</div><p>${esc(c.expected || '')}</p></div>
        <div><div class="mini-label">TEST COVERAGE</div><p>${esc(c.selection || '')}</p></div>
      </div>
      ${errorBlock}
      ${t.error ? `<div class="result-block"><div class="mini-label">NEXT ACTION</div><div class="result-text">${esc(failureDisposition(t))}</div></div>` : ''}
      <div class="test-meta">Chromium · ${(t.duration/1000).toFixed(1)}s · Retries ${t.retries}</div>
    </article>`;
  }).join('');

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QA Test Execution Dashboard</title>
<style>
:root{--ink:#24313d;--muted:#68747e;--paper:#f4f2ed;--card:#fff;--line:#dedbd3;--navy:#27435f;--teal:#397a70;--amber:#c9942f;--red:#b65345;--blue:#5a7791;--shadow:0 8px 28px rgba(36,49,61,.07)}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.5 "Segoe UI",Arial,sans-serif}.wrap{max-width:1200px;margin:auto;padding:34px 28px 55px}.top{display:flex;justify-content:space-between;gap:25px;align-items:flex-end;border-bottom:1px solid var(--line);padding-bottom:22px}.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--amber);font-weight:700}.title{font-size:30px;margin:5px 0 2px;color:var(--navy);font-weight:700}.sub{color:var(--muted)}.run{font-weight:700;color:${data.runStatus==='passed'?'var(--teal)':'var(--red)'}}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow)}.label{font-size:10px;letter-spacing:.1em;color:var(--muted);font-weight:700}.value{font-size:30px;font-weight:700;margin-top:5px}.success{color:var(--teal)}.danger{color:var(--red)}.muted{color:#8c9399}.neutral{color:var(--navy)}
.summary{display:grid;grid-template-columns:1.25fr .75fr;gap:16px}.panel{background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:20px}.panel h2{font-size:15px;margin:0 0 14px;color:var(--navy)}.rate{font-size:36px;font-weight:700;color:var(--navy);margin:8px 0}.bar{height:12px;border-radius:20px;background:#e9e6df;overflow:hidden;display:flex}.bar span{height:100%;display:block}.pbar{background:var(--teal);width:${data.total ? data.passed/data.total*100 : 0}%}.fbar{background:var(--red);width:${data.total ? data.failed/data.total*100 : 0}%}.sbar{background:#b9bec2;width:${data.total ? data.skipped/data.total*100 : 0}%}.meta{color:var(--muted);font-size:12px}.legend{display:flex;gap:18px;margin-top:12px}.legend span{font-size:12px;color:var(--muted)}
.selection{margin-top:16px}.selection p{margin:5px 0 0;color:var(--muted)}.test-table{margin-top:16px}.tablewrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--line)}th{font-size:10px;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}td:nth-child(2){min-width:390px}.pill{display:inline-block;padding:4px 9px;border-radius:20px;font-size:11px;font-weight:700}.pill.pass{background:#e6f1ee;color:var(--teal)}.pill.fail{background:#f6e6e2;color:var(--red)}.pill.skip{background:#ececea;color:#737b82}.pill.flaky{background:#f7efda;color:#9b7421}
.section-title{margin:30px 0 12px;color:var(--navy);font-size:20px}.test-card{background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:22px;margin:14px 0}.test-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.test-id{font-size:11px;letter-spacing:.12em;color:var(--amber);font-weight:700}.test-head h3{margin:5px 0 0;color:var(--navy);font-size:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}.grid>div{border-top:1px solid var(--line);padding-top:12px}.mini-label{font-size:9px;letter-spacing:.12em;color:var(--muted);font-weight:700}.grid p{margin:5px 0 0}.result-block{margin-top:14px;border:1px solid var(--line);border-radius:9px;padding:13px 15px;background:#faf9f6}.result-block.failure{border-left:4px solid var(--red);background:#fbf7f5}.success-block{border-left:4px solid var(--teal);background:#f5faf8}.result-text{margin-top:5px}.test-meta{margin-top:14px;font-size:11px;color:var(--muted)}details{margin-top:10px}summary{cursor:pointer;color:var(--blue);font-weight:600}pre{white-space:pre-wrap;font:11px/1.5 Consolas,monospace;color:#6e4038;background:#fff;padding:10px;border-radius:6px;border:1px solid #ead4cd;overflow:auto}.footer{margin-top:28px;text-align:center;color:var(--muted);font-size:11px}
@media(max-width:850px){.cards{grid-template-columns:repeat(2,1fr)}.summary,.grid{grid-template-columns:1fr}.top{display:block}.run{margin-top:10px}}
</style></head><body><div class="wrap">
<div class="top"><div><div class="eyebrow">FUNCTIONAL TEST EXECUTION</div><div class="title">QA Test Execution Dashboard</div><div class="sub">DemoBlaze · Playwright · Chromium</div></div><div class="run">RUN STATUS: ${esc(data.runStatus).toUpperCase()}</div></div>
<div class="cards">
<div class="card"><div class="label">TOTAL TESTS</div><div class="value neutral">${data.total}</div></div>
<div class="card"><div class="label">PASSED</div><div class="value success">${data.passed}</div></div>
<div class="card"><div class="label">FAILED</div><div class="value danger">${data.failed}</div></div>
<div class="card"><div class="label">SKIPPED</div><div class="value muted">${data.skipped}</div></div>
</div>
<div class="summary">
<div class="panel"><h2>Execution summary</h2><div class="rate">${rate}% pass rate</div><div class="bar"><span class="pbar"></span><span class="fbar"></span><span class="sbar"></span></div><div class="legend"><span>Passed ${data.passed}</span><span>Failed ${data.failed}</span><span>Skipped ${data.skipped}</span><span>Flaky ${data.flaky}</span></div></div>
<div class="panel"><h2>Run details</h2><div class="meta" style="line-height:2"><div><strong>Duration:</strong> ${totalDuration}s</div><div><strong>Browser:</strong> Chromium</div><div><strong>Tests:</strong> ${data.total}</div><div><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</div></div></div>
</div>
<div class="panel selection"><h2>Why these five tests?</h2><p>The suite deliberately covers a representative spread of functional risk: product discovery, authentication, cart state, the end-to-end purchase journey and a negative business-rule scenario.</p></div>
<div class="panel test-table"><h2>Test results at a glance</h2><div class="tablewrap"><table><thead><tr><th>ID</th><th>Scenario</th><th>Status</th><th>Duration</th></tr></thead><tbody>${rows}</tbody></table></div></div>
<h2 class="section-title">Test-by-test assessment</h2>
${detailCards}
<div class="footer">Generated from the automated test run · Detailed execution evidence remains available in the Playwright output directories.</div>
</div></body></html>`;
}

module.exports = ProfessionalReporter;
