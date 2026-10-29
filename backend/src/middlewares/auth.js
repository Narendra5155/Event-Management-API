import { ApiError } from '../utils/ApiError.js';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { verifyAccessToken } from '../services/token.service.js';
import { resolveSessionUser } from '../services/auth.service.js';

function readAccessToken(req) {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function loadUser(token) {
  const payload = verifyAccessToken(token);
  const user = await resolveSessionUser(payload.sub, payload.sid);
  if (!user) throw ApiError.unauthorized('Session expired. Please log in again.');
  return { user, sessionId: payload.sid };
}

/** Requires a valid access token whose session has not been revoked. */
export async function authenticate(req, _res, next) {
  const token = readAccessToken(req);
  if (!token) throw ApiError.unauthorized();

  const { user, sessionId } = await loadUser(token);
  req.user = user;
  req.sessionId = sessionId;
  next();
}

/** Attaches req.user when a valid token is present, but never rejects. */
export async function optionalAuth(req, _res, next) {
  const token = readAccessToken(req);
  if (token) {
    try {
      const { user, sessionId } = await loadUser(token);
      req.user = user;
      req.sessionId = sessionId;
    } catch {
      // Anonymous access is fine for public routes.
    }
  }
  next();
}

/** Role-based access control. Must run after authenticate. */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
