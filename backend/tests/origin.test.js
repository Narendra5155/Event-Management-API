import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { startDb, stopDb } from './helpers.js';

before(startDb);
after(stopDb);

const login = (origin) => {
  const req = request(app).post('/api/v1/auth/login').send({ email: 'nobody@test.dev', password: 'Passw0rd!' });
  return origin ? req.set('Origin', origin) : req;
};

describe('cross-origin protection', () => {
  it('rejects state-changing requests from origins that are not allowed', async () => {
    const res = await login('https://evil.example').expect(403);
    assert.match(res.body.message, /origin/);
  });

  it('allows the configured frontend and clients that send no Origin', async () => {
    // 401 = reached the route (unknown user), i.e. not blocked by the origin check.
    await login('http://localhost:5173').expect(401);
    await login().expect(401);
  });

  it('sends no CORS headers, so other sites cannot read responses', async () => {
    const res = await request(app).get('/api/v1/events').set('Origin', 'http://localhost:5173').expect(200);
    assert.equal(res.headers['access-control-allow-origin'], undefined);
    assert.equal(res.headers['access-control-allow-credentials'], undefined);
  });

  it('does not block GET requests (public data stays readable by the server)', async () => {
    await request(app).get('/api/v1/events').set('Origin', 'https://evil.example').expect(200);
  });
});
