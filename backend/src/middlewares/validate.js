import { ApiError } from '../utils/ApiError.js';

const OPTIONS = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
  errors: { wrap: { label: false } },
};

/**
 * Validates req.params, req.query and req.body against Joi schemas and replaces
 * them with the sanitized values. Unknown keys are stripped, which also keeps
 * operator injection payloads (e.g. { "$gt": "" }) out of service code.
 */
export const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;

    const { value, error } = schemas[key].validate(req[key] ?? {}, OPTIONS);
    if (error) {
      errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
      continue;
    }

    Object.defineProperty(req, key, { value, writable: true, enumerable: true, configurable: true });
  }

  if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};
