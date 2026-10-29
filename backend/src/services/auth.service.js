import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { ApiError } from '../utils/ApiError.js';
import { durationToMs } from '../utils/duration.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './token.service.js';

const INVALID_CREDENTIALS = 'Invalid email or password';
const SESSION_EXPIRED = 'Session expired. Please log in again.';
// Two tabs refreshing at the same moment both present the same token; allow the
// just-rotated token for a short window so that isn't mistaken for token theft.
const ROTATION_GRACE_MS = 30_000;
// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', env.bcryptRounds);

const PUBLIC_USER_FIELDS = 'name email role createdAt updatedAt';

const refreshExpiry = () => new Date(Date.now() + durationToMs(env.jwt.refreshTtl));

async function startSession(user, meta) {
  const session = new Session({
    user: user._id,
    userAgent: meta.userAgent?.slice(0, 512),
    ip: meta.ip,
    expiresAt: refreshExpiry(),
  });
  const refreshToken = signRefreshToken(user._id, session._id);
  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();

  return { accessToken: signAccessToken(user, session._id), refreshToken };
}

export async function register({ name, email, password, role }, meta) {
  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with this email already exists');
  }
  const user = await User.create({ name, email, password, role });
  const tokens = await startSession(user, meta);
  return { user, tokens };
}

export async function login({ email, password }, meta) {
  const user = await User.findOne({ email }).select('+password');
  const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !valid) throw ApiError.unauthorized(INVALID_CREDENTIALS);

  const tokens = await startSession(user, meta);
  user.password = undefined;
  return { user, tokens };
}

/** Rotates the refresh token. Presenting a stale token revokes every session for that user. */
export async function refresh(refreshToken, meta) {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized(SESSION_EXPIRED);
  }

  const session = await Session.findById(payload.sid).select('+refreshTokenHash +previousTokenHash');
  if (!session || session.revokedAt || String(session.user) !== payload.sub) {
    throw ApiError.unauthorized(SESSION_EXPIRED);
  }

  const presentedHash = hashToken(refreshToken);
  const isCurrent = presentedHash === session.refreshTokenHash;
  const isRecentlyRotated =
    presentedHash === session.previousTokenHash &&
    Date.now() - session.rotatedAt?.getTime() < ROTATION_GRACE_MS;

  if (!isCurrent && !isRecentlyRotated) {
    await Session.updateMany({ user: session.user, revokedAt: null }, { revokedAt: new Date() });
    throw ApiError.unauthorized('Refresh token reuse detected. All sessions have been signed out.');
  }

  const user = await User.findById(session.user);
  if (!user) throw ApiError.unauthorized(SESSION_EXPIRED);

  const nextRefreshToken = signRefreshToken(user._id, session._id);
  session.set({
    previousTokenHash: session.refreshTokenHash,
    refreshTokenHash: hashToken(nextRefreshToken),
    rotatedAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt: refreshExpiry(),
    userAgent: meta.userAgent?.slice(0, 512) ?? session.userAgent,
    ip: meta.ip ?? session.ip,
  });
  await session.save();

  return {
    user,
    tokens: { accessToken: signAccessToken(user, session._id), refreshToken: nextRefreshToken },
  };
}

/** Ends the session tied to the refresh cookie. Works even if the access token has expired. */
export async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const { sid } = verifyRefreshToken(refreshToken, { ignoreExpiration: true });
    if (mongoose.isValidObjectId(sid)) {
      await Session.updateOne({ _id: sid, revokedAt: null }, { revokedAt: new Date() });
    }
  } catch {
    // A tampered or foreign token has no session to end; cookies are cleared regardless.
  }
}

export async function logoutAll(userId) {
  await Session.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export async function listSessions(userId, currentSessionId) {
  const sessions = await Session.find({
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select('userAgent ip lastUsedAt createdAt expiresAt')
    .sort({ lastUsedAt: -1 })
    .lean();

  return sessions.map((s) => ({ ...s, current: String(s._id) === String(currentSessionId) }));
}

export async function revokeSession(userId, sessionId) {
  const { matchedCount } = await Session.updateOne(
    { _id: sessionId, user: userId, revokedAt: null },
    { revokedAt: new Date() },
  );
  if (!matchedCount) throw ApiError.notFound('Session not found');
}

/** Used by the auth middleware: returns the user only if their session is still active. */
export async function resolveSessionUser(userId, sessionId) {
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(sessionId)) return null;

  const [user, session] = await Promise.all([
    User.findById(userId).select(PUBLIC_USER_FIELDS).lean(),
    Session.exists({ _id: sessionId, user: userId, revokedAt: null, expiresAt: { $gt: new Date() } }),
  ]);
  return user && session ? user : null;
}
