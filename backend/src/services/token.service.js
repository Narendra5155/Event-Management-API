import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const VERIFY_OPTIONS = { algorithms: ['HS256'] };

export function signAccessToken(user, sessionId) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, sid: String(sessionId) },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl },
  );
}

export function signRefreshToken(userId, sessionId) {
  return jwt.sign({ sub: String(userId), sid: String(sessionId) }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl,
    jwtid: crypto.randomUUID(),
  });
}

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret, VERIFY_OPTIONS);

export const verifyRefreshToken = (token, options = {}) =>
  jwt.verify(token, env.jwt.refreshSecret, { ...VERIFY_OPTIONS, ...options });

/** Refresh tokens are stored hashed so a database leak can't be replayed. */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
