import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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
export async function measure(page, name, stateNames, run) {
  const started = performance.now();
  const report = {
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    environment: process.env.TF_BUILD ? 'Azure Pipelines' : 'local',
    startedAt: new Date().toISOString(),
    browser: page.context().browser().version(),
    role: 'sandbox-admin', tags,
    states: Object.fromEntries(stateNames.map(state => [state, { coverage: 'incomplete', reason: 'Not reached' }])),
    loadErrors: [],
    coverage: 'incomplete'
  };
  function save() {
    report.elapsedMs = elapsed(started);
    writeFileSync(join(process.env.PILOT_OUTPUT, name + '.json'), JSON.stringify(report, null, 2) + '\n');
  }
  save();

  // Ignore external services. A failed app or data request can leave a partial list visible.
  const origin = process.env.PILOT_URL;
  const appRequest = req => new URL(req.url()).origin === origin &&
    ['document', 'xhr', 'fetch', 'script', 'stylesheet'].includes(req.resourceType());
  page.on('response', res => {
    if (!appRequest(res.request())) return;
    if (res.status() >= 400) {
      report.loadErrors.push(`HTTP ${res.status()} ${res.url()}`);
    }
    const location = res.headers().location;
    if (location && new URL(location, res.url()).pathname === '/login') {
      report.loadErrors.push(`Login redirect from ${res.url()} to ${location}`);
    }
  });
  page.on('requestfailed', req => {
    if (appRequest(req)) report.loadErrors.push(`${req.failure()?.errorText} ${req.url()}`);
  });

  async function scan(label, prepare, scope) {
    const entered = performance.now();
    const errorOffset = report.loadErrors.length;
    const state = report.states[label] = { coverage: 'incomplete' };
    try {
      await prepare();
      const scanUrl = page.url();
      const builder = new AxeBuilder({ page }).withTags(tags);
      if (scope) builder.include(scope);
      const scanStart = performance.now();
      const result = await builder.analyze();
      state.axeMs = elapsed(scanStart);
      report.axe = result.testEngine.version;
      state.violations = findings(result.violations);
      state.needsReview = findings(result.incomplete);
      if (page.url() !== scanUrl) throw new Error(`Navigation during scan of ${scanUrl}`);
      if (report.loadErrors.length > errorOffset) throw new Error(report.loadErrors.slice(errorOffset).join('\n'));
      state.coverage = 'scanned';
      delete state.reason;
    } catch (error) {
      state.reason = error.message;
    } finally {
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
    console.log(`${name}: ${report.coverage}, ${report.elapsedMs} ms`);
  }
}
