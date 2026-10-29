import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

let mongo;

export async function startDb() {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

export async function stopDb() {
  await disconnectDB();
  await mongo?.stop();
}

export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

/** A supertest agent keeps cookies between requests, like a browser. */
export const agent = () => request.agent(app);

let counter = 0;
export async function signUp(role = 'attendee', overrides = {}) {
  const client = agent();
  counter += 1;
  const body = {
    name: `User ${counter}`,
    email: `user${counter}@test.dev`,
    password: 'Passw0rd!',
    role,
    ...overrides,
  };
  const res = await client.post('/api/v1/auth/register').send(body).expect(201);
  return { client, user: res.body.data.user, credentials: body };
}

export const futureEvent = (overrides = {}) => {
  const start = new Date(Date.now() + 7 * 86_400_000);
  return {
    title: 'Test Conference',
    description: 'A conference used in automated tests.',
    category: 'conference',
    venue: { name: 'Test Hall', city: 'Testville' },
    startDate: start.toISOString(),
    endDate: new Date(start.getTime() + 3_600_000).toISOString(),
    capacity: 2,
    ...overrides,
  };
};

export function cookieValue(res, name) {
  const header = res.headers['set-cookie'] ?? [];
  const match = header.find((c) => c.startsWith(`${name}=`));
  return match?.split(';')[0].slice(name.length + 1);
}
