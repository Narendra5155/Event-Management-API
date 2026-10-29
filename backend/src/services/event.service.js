import { Event } from '../models/event.model.js';
import { Registration } from '../models/registration.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const SORTS = {
  date: { startDate: 1 },
  '-date': { startDate: -1 },
  newest: { createdAt: -1 },
  popular: { registeredCount: -1, startDate: 1 },
  price: { price: 1, startDate: 1 },
};

// Cards don't need the long description or private join link.
const LIST_FIELDS = '-description -onlineUrl';

const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const isOwner = (event, user) =>
  Boolean(user) && String(event.organizer?._id ?? event.organizer) === String(user._id);

const canManage = (event, user) => isOwner(event, user) || user?.role === 'admin';

function assertCanManage(event, user) {
  if (!canManage(event, user)) throw ApiError.forbidden('Only the organizer or an admin can manage this event');
}

async function findEventOr404(id) {
  const event = await Event.findById(id);
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export async function listEvents({ page, limit, search, category, city, from, to, when, sort }) {
  const now = new Date();
  const filter = { status: 'published' };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (city) filter['venue.city'] = { $regex: `^${escapeRegex(city)}`, $options: 'i' };

  const startDate = {};
  if (when === 'upcoming') startDate.$gte = now;
  if (when === 'past') startDate.$lt = now;
  if (from && (!startDate.$gte || from > startDate.$gte)) startDate.$gte = from;
  if (to) startDate.$lte = to;
  if (Object.keys(startDate).length) filter.startDate = startDate;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .select(LIST_FIELDS)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('organizer', 'name')
      .lean(),
    Event.countDocuments(filter),
  ]);

  return { events, pagination: paginationMeta(page, limit, total) };
}

export async function getEvent(id, user) {
  const event = await Event.findById(id).populate('organizer', 'name').lean();
  if (!event) throw ApiError.notFound('Event not found');

  const manage = canManage(event, user);
  if (event.status === 'draft' && !manage) throw ApiError.notFound('Event not found');

  const isRegistered = user
    ? Boolean(await Registration.exists({ event: id, user: user._id, status: 'confirmed' }))
    : false;

  // The join link is only for people who are attending or running the event.
  if (!isRegistered && !manage) delete event.onlineUrl;

  return { ...event, isRegistered, canManage: manage };
}

export async function createEvent(data, user) {
  const event = await Event.create({ ...data, organizer: user._id });
  return event;
}

export async function updateEvent(id, data, user) {
  const event = await findEventOr404(id);
  assertCanManage(event, user);

  if (data.capacity !== undefined && data.capacity < event.registeredCount) {
    throw ApiError.badRequest(
      `Capacity cannot be lower than the ${event.registeredCount} people already registered`,
    );
  }
  if (data.startDate && +data.startDate !== +event.startDate && data.startDate < new Date()) {
    throw ApiError.badRequest('Start date must be in the future');
  }

  event.set(data);
  if (!event.isOnline && (!event.venue?.name || !event.venue?.city)) {
    throw ApiError.badRequest('Venue name and city are required for in-person events');
  }

  await event.save();
  return event;
}

export async function deleteEvent(id, user) {
  const event = await findEventOr404(id);
  assertCanManage(event, user);
  await Promise.all([event.deleteOne(), Registration.deleteMany({ event: id })]);
}

export async function registerForEvent(id, user) {
  const event = await Event.findById(id).select('status startDate').lean();
  if (!event || event.status === 'draft') throw ApiError.notFound('Event not found');
  if (event.status === 'cancelled') throw ApiError.badRequest('This event has been cancelled');
  if (event.startDate < new Date()) throw ApiError.badRequest('This event has already started');

  if (await Registration.exists({ event: id, user: user._id, status: 'confirmed' })) {
    throw ApiError.conflict('You are already registered for this event');
  }

  // Reserve a seat atomically so concurrent sign-ups can never exceed capacity.
  const reserved = await Event.findOneAndUpdate(
    { _id: id, status: 'published', $expr: { $lt: ['$registeredCount', '$capacity'] } },
    { $inc: { registeredCount: 1 } },
    { returnDocument: 'after', projection: { registeredCount: 1, capacity: 1 } },
  ).lean();
  if (!reserved) throw ApiError.conflict('Sorry, this event is sold out');

  try {
    const registration = await Registration.findOneAndUpdate(
      { event: id, user: user._id, status: { $ne: 'confirmed' } },
      { $set: { status: 'confirmed' } },
      { upsert: true, returnDocument: 'after' },
    ).lean();
    return { registration, registeredCount: reserved.registeredCount, capacity: reserved.capacity };
  } catch (err) {
    await Event.updateOne({ _id: id }, { $inc: { registeredCount: -1 } });
    // A duplicate key here means a parallel request already confirmed this user.
    if (err?.code === 11000) throw ApiError.conflict('You are already registered for this event');
    throw err;
  }
}

export async function cancelRegistration(id, user) {
  const registration = await Registration.findOneAndUpdate(
    { event: id, user: user._id, status: 'confirmed' },
    { $set: { status: 'cancelled' } },
  ).lean();
  if (!registration) throw ApiError.notFound('You are not registered for this event');

  const event = await Event.findOneAndUpdate(
    { _id: id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
    { returnDocument: 'after', projection: { registeredCount: 1, capacity: 1 } },
  ).lean();
  return { registeredCount: event?.registeredCount ?? 0, capacity: event?.capacity };
}

export async function listAttendees(id, user) {
  const event = await Event.findById(id).select('title capacity registeredCount organizer startDate').lean();
  if (!event) throw ApiError.notFound('Event not found');
  assertCanManage(event, user);

  const attendees = await Registration.find({ event: id, status: 'confirmed' })
    .select('user createdAt')
    .populate('user', 'name email')
    .sort({ createdAt: 1 })
    .lean();

  return { event, attendees };
}

export async function listMyEvents(user, { page, limit, status }) {
  const filter = { organizer: user._id };
  if (status) filter.status = status;

  const [events, total, [stats]] = await Promise.all([
    Event.find(filter)
      .select(LIST_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
    Event.aggregate([
      { $match: { organizer: user._id } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          upcoming: { $sum: { $cond: [{ $gte: ['$startDate', new Date()] }, 1, 0] } },
          totalRegistrations: { $sum: '$registeredCount' },
          totalCapacity: { $sum: '$capacity' },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  return {
    events,
    pagination: paginationMeta(page, limit, total),
    stats: stats ?? {
      totalEvents: 0,
      published: 0,
      upcoming: 0,
      totalRegistrations: 0,
      totalCapacity: 0,
    },
  };
}
