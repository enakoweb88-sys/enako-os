const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), ts = require('typescript');

let fail = false, events = 0;
const requests = [];
function load(file) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, Event, window: { dispatchEvent: () => events++ }, require: () => ({ apiRequest: async (path, options) => { requests.push({ path, options }); if (fail) throw Error('Save failed'); return { success: true }; } }) };
  vm.runInNewContext(compiled, context); return context.exports;
}
(async () => {
  const { notificationsApi: alerts } = load('src/lib/api/notifications.ts');
  const before = alerts.notificationReadVersion();
  await alerts.markNotificationRead('alert/id');
  assert.equal(requests.at(-1).path, '/notifications/alert%2Fid/read');
  assert.equal(requests.at(-1).options.method, 'PATCH');
  assert.equal(alerts.notificationReadVersion(), before + 1); assert.equal(events, 1);
  fail = true;
  await assert.rejects(alerts.markNotificationRead('failed-alert'), /Save failed/);
  assert.equal(alerts.notificationReadVersion(), before + 1); assert.equal(events, 1);
  fail = false;
  await alerts.markAllNotificationsRead(); assert.equal(events, 2);
  const { messagesApi: messages } = load('src/lib/api/messages.ts');
  await messages.markMessagesRead('dm:fixture', ['seen-message']);
  assert.equal(requests.at(-1).path, '/messages/read');
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { channel: 'dm:fixture', messageIds: ['seen-message'] });
  await messages.unreadMessages(); assert.equal(requests.at(-1).path, '/messages/unread');
  console.log('PASS notification saves propagate only after success; failures remain visible; message reads send exact visible IDs and load the persistent unread endpoint');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
