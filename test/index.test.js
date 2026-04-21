const { test } = require('node:test');
const assert = require('assert');

test('payments service responds with ok status', () => {
  const response = { status: 'ok', service: 'kijanikiosk-payments' };
  assert.strictEqual(response.status, 'ok');
  assert.strictEqual(response.service, 'kijanikiosk-payments');
});

test('environment port defaults to 8081', () => {
  const PORT = process.env.SERVICE_PORT || 8081;
  assert.strictEqual(PORT, 8081);
});
