import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authenticateJWT } from '../src/middleware/auth.js';

process.env.JWT_SECRET = 'test-secret';

const invokeMiddleware = (authorization) => {
  const req = { headers: { authorization } };
  const result = { statusCode: null, body: null, nextCalled: false };
  const res = {
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  authenticateJWT(req, res, () => {
    result.nextCalled = true;
  });

  return result;
};

test('authenticateJWT returns a distinct 401 for a missing token', () => {
  const result = invokeMiddleware(undefined);

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.code, 'AUTH_TOKEN_INVALID');
  assert.equal(result.nextCalled, false);
});

test('authenticateJWT returns a distinct 401 for an expired token', () => {
  const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: -1 });
  const result = invokeMiddleware(`Bearer ${token}`);

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.code, 'AUTH_TOKEN_INVALID');
  assert.equal(result.nextCalled, false);
});

test('authenticateJWT accepts a valid token', () => {
  const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  let nextCalled = false;

  authenticateJWT(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 'user-1');
});
