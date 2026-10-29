import { User } from '../models/user.model.js';
import { Registration } from '../models/registration.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const REGISTRATION_EVENT_FIELDS =
  'title startDate endDate venue isOnline coverImage category status price capacity registeredCount';

export async function listMyRegistrations(userId, { when }) {
  const registrations = await Registration.find({ user: userId, status: 'confirmed' })
    .select('event status createdAt')
    .sort({ createdAt: -1 })
    .populate('event', REGISTRATION_EVENT_FIELDS)
    .lean();

  const now = new Date();
  return registrations.filter(({ event }) => {
    if (!event) return false;
    if (when === 'upcoming') return event.startDate >= now;
    if (when === 'past') return event.startDate < now;
    return true;
  });
}

export async function listUsers({ page, limit, role, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function updateUserRole(id, role, actor) {
  if (String(actor._id) === id) throw ApiError.badRequest('You cannot change your own role');

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: 'after', runValidators: true },
  )
    .select('name email role createdAt')
    .lean();
  if (!user) throw ApiError.notFound('User not found');
  return user;
}
