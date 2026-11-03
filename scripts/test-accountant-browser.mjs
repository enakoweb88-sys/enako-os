import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

// Use installed Chromium with a fresh temporary profile. All API responses are
// fixtures; this test never logs into or changes a real employee's account.
const browserPath = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
assert.ok(browserPath, 'Set CHROME_PATH to an installed Chromium browser');
const port = await new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});
const profile = mkdtempSync(path.join(tmpdir(), 'enako-accountant-check-'));
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { windowsHide: true, stdio: 'ignore' });
let browser, socket;
let failedBanking = false, breakRender = false;
const errors = [];
try {
  const base = `http://127.0.0.1:${port}`;
  for (let retry = 0; ; retry++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (retry > 100) throw new Error('Preview did not start');
    await delay(100);
  }
  browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let debugPort;
  for (let retry = 0; ; retry++) {
    try { debugPort = Number(readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]); if (debugPort) break; } catch {}
    if (retry > 100) throw new Error('Browser did not start');
    await delay(100);
  }
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onmessage = async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id); if (!task) return;
      clearTimeout(task.timeout); pending.delete(message.id);
      if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const request = message.params;
      const pathname = new URL(request.request.url).pathname;
      const fixtures = {
        '/finance/banking': [{ name: 'Company bank', bank: 'Test bank', accountNo: '123', balance: '1500', currency: 'XAF' }],
        '/finance/budget': [{ category: 'Operations', budget: 0, actual: 0 }],
        '/finance/cash-position': { chartData: [{ name: 'Mon', Inflow: 250, Outflow: 100 }] },
        '/finance/invoices': { summary: { paid: 250, pending: 0 }, recent: [{ id: 'invoice', client: 'Test client', amount: 250, status: 'Paid' }] },
        '/finance/accounts-summary': { assets: 12345, revenueYtd: 500, netProfit: 250, settlementAccuracy: breakRender ? {} : '99%' },
      };
      const key = Object.keys(fixtures).find(key => pathname.endsWith(key));
      const failed = failedBanking && key === '/finance/banking';
      await send('Fetch.fulfillRequest', { requestId: request.requestId, responseCode: failed ? 503 : 200,
        responseHeaders: [{ name: 'content-type', value: 'application/json' }, { name: 'access-control-allow-origin', value: '*' }, { name: 'access-control-allow-headers', value: 'authorization, content-type' }, { name: 'access-control-allow-methods', value: 'GET, POST, PATCH, DELETE, OPTIONS' }],
        body: Buffer.from(JSON.stringify(failed ? { message: 'Temporarily unavailable' } : key ? fixtures[key] : [])).toString('base64') });
    }
  };
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => {
    for (let retry = 0; retry < 160; retry++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Browser condition timed out: ${expression}`);
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*://*/api/v1/*' }] });
  const user = { id: 'accountant-test', fullName: 'Test Accountant', email: 'accountant@example.test', role: 'EMPLOYEE', title: 'Accountant', department: 'Finance' };
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `sessionStorage.setItem('enako_user', ${JSON.stringify(JSON.stringify(user))}); sessionStorage.setItem('enako_access_token', 'test-only-token');` });
  await send('Page.navigate', { url: `${base}/app/dashboard` });
  await waitFor("document.body.innerText.includes('Company bank') && document.body.innerText.includes('Test client')");
  assert.equal(await evaluate("document.querySelectorAll('a[href^=\"/app/employees\"], a[href^=\"/app/websites\"], a[href^=\"/app/security\"]').length"), 0);
  assert.equal(errors.length, 0);
  console.log('PASS: accountant production dashboard loads with real browser rendering and correct sidebar restrictions.');
  const refresh = () => evaluate("[...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Refresh').click()");
  failedBanking = true; await refresh();
  await waitFor("document.body.innerText.includes('Could not load: bank accounts')");
  assert.ok(await evaluate("document.body.innerText.includes('Test client')"));
  failedBanking = false; await refresh();
  await waitFor("document.body.innerText.includes('Company bank') && !document.body.innerText.includes('Could not load:')");
  assert.equal(errors.length, 0);
  await evaluate("document.body.dataset.previousDocument = 'yes'");
  await send('Page.reload');
  await waitFor("document.body && !document.body.dataset.previousDocument && document.body.innerText.includes('Company bank') && document.body.innerText.includes('Test client')");
  console.log('PASS: partial API outage, Refresh recovery and full page reload preserve a working accountant dashboard.');
  breakRender = true; await refresh();
  await waitFor("document.body.innerText.includes('This page could not be displayed')");
  assert.ok(await evaluate("document.querySelector('aside') !== null"));
  await evaluate("history.pushState({}, '', '/app/reports'); dispatchEvent(new PopStateEvent('popstate'))");
  await waitFor("document.body.innerText.includes('My Work Reports')");
  console.log('PASS: a forced page error shows recovery controls, preserves navigation and allows opening Reports.');
} finally {
  socket?.close();
  browser?.kill();
  preview.kill();
}
