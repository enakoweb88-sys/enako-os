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
let conversationOpened = false; const chatMessages = []; const postedTasks = [];
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
      const channel = { id: 'private-pair', name: 'dm:test-pair', isGeneral: false, members: [{ userId: 'accountant-test', user: { id: 'accountant-test', fullName: 'Test Employee' } }, { userId: 'peer', user: { id: 'peer', fullName: 'Selected Employee' } }] };
      const fixtures = {
        '/users': [{ id: 'accountant-test', fullName: 'Test CEO', role: 'CEO', status: 'ACTIVE' }, { id: 'peer', fullName: 'Selected Employee', role: 'EMPLOYEE', status: 'ACTIVE' }],
        '/tasks': postedTasks,
        '/private-chat/contacts': [{ id: 'peer', fullName: 'Selected Employee' }],
        '/channels': [{ id: 'general', name: 'general', isGeneral: true }, ...(conversationOpened ? [channel] : [])],
        '/messages': chatMessages,
      };
      let response = [];
      if (pathname.endsWith('/tasks') && request.request.method === 'POST') { const body = JSON.parse(request.request.postData); response = { id: 'assigned-test', ...body, creatorId: 'accountant-test' }; postedTasks.push(response); }
      else if (pathname.endsWith('/private-chat') && request.request.method === 'POST') { conversationOpened = true; response = channel; }
      else if (pathname.endsWith('/messages') && request.request.method === 'POST') {
        const body = JSON.parse(request.request.postData);
        response = { id: 'reply', channel: channel.name, content: body.content, senderId: 'accountant-test', createdAt: new Date().toISOString(), sender: { fullName: 'Test Employee' } };
        chatMessages.push(response);
      } else { const key = Object.keys(fixtures).find(key => pathname.endsWith(key)); response = key ? fixtures[key] : []; }
      await send('Fetch.fulfillRequest', { requestId: request.requestId, responseCode: 200,
        responseHeaders: [{ name: 'content-type', value: 'application/json' }, { name: 'access-control-allow-origin', value: '*' }, { name: 'access-control-allow-headers', value: 'authorization, content-type' }, { name: 'access-control-allow-methods', value: 'GET, POST, PATCH, DELETE, OPTIONS' }],
        body: Buffer.from(JSON.stringify(response)).toString('base64') });
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
  const user = { id: 'accountant-test', fullName: 'Test Employee', email: 'accountant@example.test', role: process.env.WORK_TEST_ROLE || 'EMPLOYEE', title: 'DevOps / Infrastructure Engineer', department: 'Engineering' };
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `sessionStorage.setItem('enako_user', ${JSON.stringify(JSON.stringify(user))}); sessionStorage.setItem('enako_access_token', 'test-only-token');` });
  if (user.role === 'CEO') {
    await send('Page.navigate', { url: base + '/app/tasks/new' });
    await waitFor("[...document.querySelectorAll('select option')].some(option => option.textContent.includes('Selected Employee'))");
    const selector = "[...document.querySelectorAll('select')].find(select => [...select.options].some(option => option.textContent.includes('Select an employee')))";
    assert.equal(await evaluate(selector + '.value'), '');
    await evaluate("const input = document.querySelector('form input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Assignment verification task'); input.dispatchEvent(new Event('input', { bubbles: true }));");
    await evaluate("const select = " + selector + "; select.value = 'peer'; select.dispatchEvent(new Event('change', { bubbles: true }));");
    await evaluate("document.querySelector('form').requestSubmit()");
    await waitFor("document.body.innerText.includes('Operational Task Center')");
    assert.equal(postedTasks.length, 1); assert.equal(postedTasks[0].assigneeId, 'peer');
    console.log('PASS: CEO assignment starts with no implicit owner and submits the selected employee ID.');
  }
  await send('Page.navigate', { url: base + '/app/chat' });
  await waitFor("document.querySelector('#private-recipient')?.options.length > 1");
  await evaluate("const select = document.querySelector('#private-recipient'); select.value = 'peer'; select.dispatchEvent(new Event('change', { bubbles: true }));");
  await waitFor("document.querySelector('main header h2')?.innerText.includes('Selected Employee')");
  assert.ok(conversationOpened);
  assert.ok(await evaluate("location.search.includes('channel=dm')"));
  console.log('PASS: selecting an employee immediately opens the private thread and updates its URL.');
  await evaluate("const area = document.querySelector('main textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(area, 'Private test reply'); area.dispatchEvent(new Event('input', { bubbles: true }));");
  await waitFor("!document.querySelector('main form button').disabled");
  await evaluate("document.querySelector('main form').requestSubmit()");
  await waitFor("document.querySelector('main').innerText.includes('Private test reply')");
  assert.equal(chatMessages.length, 1);
  assert.equal(chatMessages[0].channel, 'dm:test-pair');
  assert.equal(errors.length, 0);
  await evaluate("[...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Open private conversation').click()");
  await waitFor("document.querySelector('main').innerText.includes('Private test reply') && !document.querySelector('main').innerText.includes('Loading messages')");
  await evaluate("document.body.dataset.previousDocument = 'yes'");
  await send('Page.reload');
  await waitFor("document.body && !document.body.dataset.previousDocument && document.querySelector('main header h2')?.innerText.includes('Selected Employee')");
  await waitFor("document.querySelector('main').innerText.includes('Private test reply')");
  console.log('PASS: private messages stay in the selected two-person thread, including after reload.');

} finally {
  socket?.close();
  browser?.kill();
  preview.kill();
}
