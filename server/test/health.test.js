import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('GET /api/health returns OK', async (t) => {
  const srv = app.listen(0);
  const addr = srv.address();
  const port = addr.port;

  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'OK');

  await new Promise((resolve) => srv.close(resolve));
});
