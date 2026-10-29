import * as authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from '../utils/cookies.js';

const requestMeta = (req) => ({ userAgent: req.get('user-agent'), ip: req.ip });

export async function register(req, res) {
  const { user, tokens } = await authService.register(req.body, requestMeta(req));
  setAuthCookies(res, tokens);
  return ApiResponse.created(res, { user }, 'Account created successfully');
}

export async function login(req, res) {
  const { user, tokens } = await authService.login(req.body, requestMeta(req));
  setAuthCookies(res, tokens);
  return ApiResponse.ok(res, { user }, 'Logged in successfully');
}

export async function refresh(req, res) {
  try {
    const { user, tokens } = await authService.refresh(req.cookies[REFRESH_COOKIE], requestMeta(req));
    setAuthCookies(res, tokens);
    return ApiResponse.ok(res, { user }, 'Session refreshed');
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
}

export async function logout(req, res) {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearAuthCookies(res);
  return ApiResponse.ok(res, null, 'Logged out successfully');
}

export async function logoutAll(req, res) {
  await authService.logoutAll(req.user._id);
  clearAuthCookies(res);
  return ApiResponse.ok(res, null, 'Logged out from all devices');
}

export function me(req, res) {
  return ApiResponse.ok(res, { user: req.user });
}

export async function listSessions(req, res) {
  const sessions = await authService.listSessions(req.user._id, req.sessionId);
  return ApiResponse.ok(res, { sessions });
}

export async function revokeSession(req, res) {
  await authService.revokeSession(req.user._id, req.params.id);
  return ApiResponse.ok(res, null, 'Session revoked');
}
