import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

function normalize(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof jwt.TokenExpiredError) return ApiError.unauthorized('Access token expired');
  if (err instanceof jwt.JsonWebTokenError) return ApiError.unauthorized('Invalid token');

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest('Validation failed', errors);
  }
  if (err instanceof mongoose.Error.CastError) return ApiError.badRequest(`Invalid ${err.path}`);
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return ApiError.conflict(`An account with this ${field} already exists`);
  }
  if (err?.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body');
  if (err?.type === 'entity.too.large') return new ApiError(413, 'Request body too large');

  return new ApiError(500, 'Internal server error');
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const apiError = normalize(err);
  if (apiError.statusCode >= 500 && !env.isTest) console.error(err);

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors && { errors: apiError.errors }),
    ...(!env.isProd && apiError.statusCode >= 500 && { stack: err.stack }),
  });
}
