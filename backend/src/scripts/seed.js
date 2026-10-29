import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Event } from '../models/event.model.js';
import { Registration } from '../models/registration.model.js';
import { Session } from '../models/session.model.js';
import {
  DEMO_ATTENDEE_COUNT,
  DEMO_ATTENDEE_PASSWORD,
  EVENTS,
  FIRST_NAMES,
  LAST_NAMES,
  STAFF,
} from './seedData.js';

const DAY = 86_400_000;
const HOUR = 3_600_000;

// Seeded PRNG so every run produces the same attendees and reservations.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2026);

function sample(items, count) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

const coverUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

function schedule({ day, hour, hours }) {
  const start = new Date(Date.now() + day * DAY);
  start.setHours(hour, 0, 0, 0);
  return { startDate: start, endDate: new Date(start.getTime() + hours * HOUR) };
}

function demoAttendees(passwordHash) {
  return Array.from({ length: DEMO_ATTENDEE_COUNT }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) * 3 + (i % 3)];
    return {
      name: `${first} ${last}`,
      email: `${first}.${last}.${i + 1}@example.com`.toLowerCase(),
      password: passwordHash,
      role: 'attendee',
    };
  });
}

async function seed() {
  await connectDB();

  await Promise.all([User, Event, Registration, Session].map((model) => model.deleteMany({})));
  await Promise.all([User, Event, Registration, Session].map((model) => model.syncIndexes()));

  // Staff go through create() so the pre-save hook hashes each password.
  const staff = await User.create(STAFF);
  const byEmail = Object.fromEntries(staff.map((u) => [u.email, u]));
  const organizers = staff.filter((u) => u.role === 'organizer');
  const mainAttendee = byEmail['attendee@eventsphere.dev'];

  // The 60 demo attendees share one password, so hash it once and insert in bulk.
  const sharedHash = await bcrypt.hash(DEMO_ATTENDEE_PASSWORD, env.bcryptRounds);
  const crowd = await User.insertMany(demoAttendees(sharedHash));

  const events = await Event.create(
    EVENTS.map(({ day, hour, hours, fill, organizer, joins, image, ...event }) => ({
      ...event,
      ...schedule({ day, hour, hours }),
      venue: event.venue ?? {},
      coverImage: coverUrl(image),
      organizer: organizers[organizer]._id,
    })),
  );

  // Every seat count is backed by a real registration, so attendee lists match the numbers.
  const registrations = [];
  events.forEach((event, i) => {
    const spec = EVENTS[i];
    if (event.status === 'draft') return;

    const attendees = spec.joins ? [mainAttendee] : [];
    const target = Math.min(Math.round(event.capacity * spec.fill), event.capacity);
    attendees.push(...sample(crowd, Math.max(0, Math.min(target - attendees.length, crowd.length))));

    // Reservations trickle in over the month before the event (or before today).
    const latest = Math.min(event.startDate.getTime(), Date.now()) - HOUR;
    for (const user of attendees) {
      const createdAt = new Date(latest - random() * 30 * DAY);
      registrations.push({ event: event._id, user: user._id, status: 'confirmed', createdAt, updatedAt: createdAt });
    }
    event.registeredCount = attendees.length;
  });

  // Raw insert keeps the back-dated timestamps above.
  await Registration.collection.insertMany(registrations);
  await Event.bulkWrite(
    events.map((e) => ({
      updateOne: { filter: { _id: e._id }, update: { $set: { registeredCount: e.registeredCount } } },
    })),
  );

  const counts = events.reduce((acc, e) => {
    const bucket = e.status !== 'published' ? e.status : e.startDate < new Date() ? 'past' : 'upcoming';
    acc[bucket] = (acc[bucket] ?? 0) + 1;
    return acc;
  }, {});

  console.log(
    `Seeded ${staff.length + crowd.length} users, ${events.length} events ` +
      `(${counts.upcoming ?? 0} upcoming, ${counts.past ?? 0} past, ${counts.draft ?? 0} draft, ` +
      `${counts.cancelled ?? 0} cancelled) and ${registrations.length} registrations.\n`,
  );
  console.log('Demo accounts:');
  for (const u of STAFF) console.log(`  ${u.role.padEnd(10)} ${u.email.padEnd(28)} ${u.password}`);
  console.log(`  ${'attendee'.padEnd(10)} ${`${crowd[0].email} (+${crowd.length - 1} more)`.padEnd(28)} ${DEMO_ATTENDEE_PASSWORD}`);

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});
