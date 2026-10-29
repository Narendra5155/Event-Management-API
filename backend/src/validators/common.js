import Joi from 'joi';

export const objectId = Joi.string().hex().length(24).messages({
  'string.hex': '{#label} must be a valid id',
  'string.length': '{#label} must be a valid id',
});

export const idParams = Joi.object({ id: objectId.required() });

export const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
};
