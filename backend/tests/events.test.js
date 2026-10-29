import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { clearDb, futureEvent, signUp, startDb, stopDb } from './helpers.js';

before(startDb);
after(stopDb);
beforeEach(clearDb);

async function createEvent(client, overrides) {
  const res = await client.post('/api/v1/events').send(futureEvent(overrides)).expect(201);
  return res.body.data.event;
}

describe('events & RBAC', () => {
  it('forbids attendees from creating events', async () => {
    const { client } = await signUp('attendee');
    await client.post('/api/v1/events').send(futureEvent()).expect(403);
  });

  it('validates event payloads', async () => {
    const { client } = await signUp('organizer');
    const res = await client
      .post('/api/v1/events')
      .send(futureEvent({ endDate: new Date(Date.now() - 1000).toISOString(), capacity: 0 }))
      .expect(400);
    const fields = res.body.errors.map((e) => e.field);
    assert.ok(fields.includes('endDate'));
    assert.ok(fields.includes('capacity'));
  });

  it('lets only the owner or an admin edit an event', async () => {
    const owner = await signUp('organizer');
    const other = await signUp('organizer');
    const admin = await signUp('attendee');
    await User.updateOne({ _id: admin.user._id }, { role: 'admin' });

    const event = await createEvent(owner.client);
    await other.client.patch(`/api/v1/events/${event._id}`).send({ title: 'Hijacked' }).expect(403);
    await owner.client.patch(`/api/v1/events/${event._id}`).send({ title: 'Renamed' }).expect(200);
    // Role changes apply immediately because the user is reloaded on every request.
    await admin.client.patch(`/api/v1/events/${event._id}`).send({ title: 'By admin' }).expect(200);
  });

  it('enforces capacity and prevents duplicate registrations', async () => {
    const organizer = await signUp('organizer');
    const event = await createEvent(organizer.client, { capacity: 2 });
    const [a, b, c] = await Promise.all([signUp(), signUp(), signUp()]);

    await a.client.post(`/api/v1/events/${event._id}/register`).expect(201);
    await a.client.post(`/api/v1/events/${event._id}/register`).expect(409);
    await b.client.post(`/api/v1/events/${event._id}/register`).expect(201);
    const full = await c.client.post(`/api/v1/events/${event._id}/register`).expect(409);
    assert.match(full.body.message, /sold out/);

    await a.client.delete(`/api/v1/events/${event._id}/register`).expect(200);
    await c.client.post(`/api/v1/events/${event._id}/register`).expect(201);

    const detail = await request(app).get(`/api/v1/events/${event._id}`).expect(200);
    assert.equal(detail.body.data.event.registeredCount, 2);
  });

  it('never oversells under concurrent registrations', async () => {
    const organizer = await signUp('organizer');
    const event = await createEvent(organizer.client, { capacity: 3 });
    const attendees = await Promise.all(Array.from({ length: 8 }, () => signUp()));

    const results = await Promise.all(
      attendees.map(({ client }) => client.post(`/api/v1/events/${event._id}/register`)),
    );
    assert.equal(results.filter((r) => r.status === 201).length, 3);

    const detail = await request(app).get(`/api/v1/events/${event._id}`).expect(200);
    assert.equal(detail.body.data.event.registeredCount, 3);
  });

  it('hides drafts from the public listing and lets organizers see them under /mine', async () => {
    const organizer = await signUp('organizer');
    await createEvent(organizer.client, { title: 'Public one' });
    const draft = await createEvent(organizer.client, { title: 'Secret draft', status: 'draft' });

    const list = await request(app).get('/api/v1/events').expect(200);
    assert.deepEqual(list.body.data.events.map((e) => e.title), ['Public one']);
    await request(app).get(`/api/v1/events/${draft._id}`).expect(404);

    const mine = await organizer.client.get('/api/v1/events/mine').expect(200);
    assert.equal(mine.body.data.events.length, 2);
    assert.equal(mine.body.data.stats.totalEvents, 2);
  });

  it('searches events by text and filters by category', async () => {
    const organizer = await signUp('organizer');
    await createEvent(organizer.client, { title: 'Kubernetes Deep Dive', category: 'workshop' });
    await createEvent(organizer.client, { title: 'Summer Rock Night', category: 'concert' });

    const search = await request(app).get('/api/v1/events?search=kubernetes').expect(200);
    assert.deepEqual(search.body.data.events.map((e) => e.title), ['Kubernetes Deep Dive']);

    const byCategory = await request(app).get('/api/v1/events?category=concert').expect(200);
    assert.deepEqual(byCategory.body.data.events.map((e) => e.title), ['Summer Rock Night']);

    await request(app).get('/api/v1/events?category=nope').expect(400);
  });

  it('restricts the user list and role changes to admins', async () => {
    const attendee = await signUp('attendee');
    await attendee.client.get('/api/v1/users').expect(403);

    const admin = await signUp('attendee');
    await User.updateOne({ _id: admin.user._id }, { role: 'admin' });

    await admin.client
      .patch(`/api/v1/users/${attendee.user._id}/role`)
      .send({ role: 'organizer' })
      .expect(200);
    await attendee.client.post('/api/v1/events').send(futureEvent()).expect(201);

    await admin.client.patch(`/api/v1/users/${admin.user._id}/role`).send({ role: 'attendee' }).expect(400);
  });
});
