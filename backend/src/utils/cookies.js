import { env } from '../config/env.js';
import { durationToMs } from './duration.js';

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
const REFRESH_PATH = '/api/v1/auth';

const baseOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    path: '/',
    maxAge: durationToMs(env.jwt.accessTtl),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    path: REFRESH_PATH,
    maxAge: durationToMs(env.jwt.refreshTtl),
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: REFRESH_PATH });
}
