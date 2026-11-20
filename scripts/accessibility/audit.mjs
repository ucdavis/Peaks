import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const elapsed = since => Math.round(performance.now() - since);

function findings(rules) {
  return rules.map(({ id, impact, help, helpUrl, nodes }) => ({
    id, impact, help, helpUrl,
    elements: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary }))
  }));
}

// Keep completed scans when another page, a later dialog state, or sign-in fails.
export async function measure(page, name, stateNames, run, { ignorePath } = {}) {
  const started = performance.now();
  const report = {
    commit: process.env.PILOT_COMMIT,
    checkout: process.env.PILOT_CHECKOUT,
    environment: process.env.TF_BUILD ? 'Azure Pipelines' : 'local',
    startedAt: new Date().toISOString(),
    browser: page.context().browser().version(),
    role: null, tags,
    states: Object.fromEntries(stateNames.map(state => [state, { coverage: 'incomplete', reason: 'Not reached' }])),
    loadErrors: [],
    coverage: 'incomplete'
  };
  function save() {
    report.elapsedMs = elapsed(started);
    writeFileSync(join(process.env.PILOT_OUTPUT, name + '.json'), JSON.stringify(report, null, 2) + '\n');
  }
  save();

  const origin = new URL(process.env.PILOT_URL).origin;
  const pending = new Set();
  page.on('request', req => {
    if (new URL(req.url()).origin !== origin) return;
    for (let source = req; ignorePath && source; source = source.redirectedFrom()) {
      if (new URL(source.url()).pathname === ignorePath) return;
    }
    pending.add(req);
  });
  page.on('requestfinished', req => pending.delete(req));
  page.on('response', res => {
    if (!pending.has(res.request())) return;
    if (res.status() >= 400) {
      report.loadErrors.push(`HTTP ${res.status()} ${res.url()}`);
    }
    const location = res.headers().location;
    if (location && new URL(location, res.url()).pathname === '/login') {
      report.loadErrors.push(`Login redirect from ${res.url()} to ${location}`);
    }
  });
  page.on('requestfailed', req => {
    if (pending.delete(req)) report.loadErrors.push(`${req.failure()?.errorText} ${req.url()}`);
  });
  page.on('pageerror', error => {
    report.loadErrors.push(`Application error at ${page.url()}: ${error.message}`);
  });

  async function settleRequests() {
    await expect.poll(() => [...pending].map(req => req.url()), {
      message: 'Waiting for sandbox requests to finish',
      timeout: 10_000
    }).toEqual([]);
  }

  async function scan(label, prepare, scope) {
    const entered = performance.now();
    const errorOffset = report.loadErrors.length;
    const state = report.states[label] = { coverage: 'incomplete' };
    try {
      try {
        await prepare(settleRequests);
      } finally {
        await settleRequests();
      }
      if (report.loadErrors.length === errorOffset) {
        const scanUrl = page.url();
        const builder = new AxeBuilder({ page }).withTags(tags);
        if (scope) builder.include(scope);
        const scanStart = performance.now();
        const result = await builder.analyze();
        state.axeMs = elapsed(scanStart);
        report.axe = result.testEngine.version;
        state.violations = findings(result.violations);
        state.needsReview = findings(result.incomplete);
        await settleRequests();
        if (page.url() !== scanUrl) throw new Error(`Navigation during scan of ${scanUrl}`);
        state.coverage = 'scanned';
      }
    } catch (error) {
      state.reason = error.message;
    } finally {
      pending.clear();
      const loadErrors = report.loadErrors.slice(errorOffset);
      if (loadErrors.length) {
        state.coverage = 'incomplete';
        state.reason = [...loadErrors, state.reason].filter(Boolean).join('\n');
      }
      state.url = page.url();
      state.elapsedMs = elapsed(entered);
      save();
      const count = state.violations?.reduce((n, rule) => n + rule.elements.length, 0);
      console.log(`${label}: ${state.coverage}, ${count ?? 'unknown'} violation instances, ${state.elapsedMs} ms`);
    }
  }

  try {
    await run({ scan, report });
    const missed = Object.entries(report.states).filter(([, state]) => state.coverage !== 'scanned');
    const errors = missed.map(([label, state]) => `${label}: ${state.reason} (${state.url || page.url()})`);
    if (errors.length || report.loadErrors.length) throw new Error([...errors, ...report.loadErrors].join('\n'));
    report.coverage = 'complete';
  } catch (error) {
    report.coverage = 'incomplete';
    report.error = `${error.message} (at ${page.url()})`;
    throw error;
  } finally {
    save();
    appendFileSync(join(process.env.PILOT_OUTPUT, 'run.txt'), `${name} roles: ${JSON.stringify(report.role)}\n`);
    console.log(`${name}: ${report.coverage}, ${report.elapsedMs} ms`);
  }
}
