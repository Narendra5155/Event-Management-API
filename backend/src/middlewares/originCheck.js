import { ApiError } from '../utils/ApiError.js';
import { isAllowedOrigin } from '../utils/origins.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originCheck(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin && !isAllowedOrigin(origin)) {
    return next(ApiError.forbidden('Requests from this origin are not allowed'));
  }
  next();
}
