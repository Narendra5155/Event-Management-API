import Joi from 'joi';
import { ROLES } from '../models/user.model.js';
import { idParams, pagination } from './common.js';

export const listUsersSchema = {
  query: Joi.object({
    ...pagination,
    limit: pagination.limit.default(20),
    role: Joi.string().valid(...ROLES),
    search: Joi.string().trim().max(100).allow(''),
  }),
};

export const updateRoleSchema = {
  params: idParams,
  body: Joi.object({ role: Joi.string().valid(...ROLES).required() }),
};

export const myRegistrationsSchema = {
  query: Joi.object({
    when: Joi.string().valid('upcoming', 'past', 'all').default('all'),
  }),
};
