import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { agent, clearDb, cookieValue, signUp, startDb, stopDb } from './helpers.js';

before(startDb);
after(stopDb);
beforeEach(clearDb);

describe('auth', () => {
  it('registers a user, sets http-only cookies and never leaks tokens or the password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Jane', email: 'JANE@Example.com', password: 'Passw0rd!' })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'jane@example.com');
    assert.equal(res.body.data.user.role, 'attendee');
    assert.equal(res.body.data.user.password, undefined);
    assert.equal(JSON.stringify(res.body).includes('Token'), false);

    const cookies = res.headers['set-cookie'].join(';');
    assert.match(cookies, /accessToken=.+HttpOnly/);
    assert.match(cookies, /refreshToken=.+Path=\/api\/v1\/auth/);
  });

  it('rejects weak passwords and admin self-assignment with field errors', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'J', email: 'not-an-email', password: 'weak', role: 'admin' })
      .expect(400);

    const fields = [...new Set(res.body.errors.map((e) => e.field))].sort();
    assert.deepEqual(fields, ['email', 'name', 'password', 'role']);
  });

  it('rejects duplicate emails', async () => {
    await signUp('attendee', { email: 'dup@test.dev' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email: 'dup@test.dev', password: 'Passw0rd!' })
      .expect(409);
    assert.match(res.body.message, /already exists/);
  });

  it('logs in with valid credentials and returns the current user from /me', async () => {
    const { credentials } = await signUp();
    const client = agent();

    await client
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'wrong-Passw0rd' })
      .expect(401);
    await client
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const me = await client.get('/api/v1/auth/me').expect(200);
    assert.equal(me.body.data.user.email, credentials.email);
  });

  it('requires authentication for /me', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });

  it('rotates refresh tokens and revokes every session when an old token is replayed', async () => {
    const { client } = await signUp();
    const login = await client.post('/api/v1/auth/refresh').expect(200);
    const firstRotated = cookieValue(login, 'refreshToken');

    // Rotate again so firstRotated becomes stale (outside the grace window, it's the one before previous).
    await client.post('/api/v1/auth/refresh').expect(200);
    await client.post('/api/v1/auth/refresh').expect(200);

    const replay = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${firstRotated}`)
      .expect(401);
    assert.match(replay.body.message, /reuse detected/);

    // The legitimate client is signed out too.
    await client.get('/api/v1/auth/me').expect(401);
  });

  it('logs out and invalidates the session server-side', async () => {
    const { client } = await signUp();
    const before = await client.get('/api/v1/auth/me').expect(200);
    assert.ok(before.body.data.user);

    await client.post('/api/v1/auth/logout').expect(200);
    await client.get('/api/v1/auth/me').expect(401);
    await client.post('/api/v1/auth/refresh').expect(401);
  });

  it('lists sessions and revokes another device', async () => {
    const { client, credentials } = await signUp();
    const laptop = agent();
    await laptop
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const res = await client.get('/api/v1/auth/sessions').expect(200);
    assert.equal(res.body.data.sessions.length, 2);
    const other = res.body.data.sessions.find((s) => !s.current);

    await client.delete(`/api/v1/auth/sessions/${other._id}`).expect(200);
    await laptop.get('/api/v1/auth/me').expect(401);
    await client.get('/api/v1/auth/me').expect(200);
  });
});
