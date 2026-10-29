import Joi from 'joi';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '../models/event.model.js';
import { idParams, pagination } from './common.js';

const venue = Joi.object({
  name: Joi.string().trim().max(120).allow(''),
  address: Joi.string().trim().max(200).allow(''),
  city: Joi.string().trim().max(80).allow(''),
});

const fields = {
  title: Joi.string().trim().min(3).max(120),
  description: Joi.string().trim().min(10).max(5000),
  category: Joi.string().valid(...EVENT_CATEGORIES),
  isOnline: Joi.boolean(),
  venue,
  onlineUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }).allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  capacity: Joi.number().integer().min(1).max(100_000),
  price: Joi.number().min(0).max(100_000).precision(2),
  coverImage: Joi.string().trim().uri({ scheme: ['http', 'https'] }).allow(''),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(10).unique(),
  status: Joi.string().valid(...EVENT_STATUSES),
};

export const createEventSchema = {
  body: Joi.object({
    ...fields,
    title: fields.title.required(),
    description: fields.description.required(),
    category: fields.category.required(),
    isOnline: fields.isOnline.default(false),
    venue: venue.when('isOnline', {
      is: false,
      then: venue
        .keys({
          name: Joi.string().trim().max(120).required(),
          city: Joi.string().trim().max(80).required(),
        })
        .required()
        .messages({ 'any.required': 'Venue name and city are required for in-person events' }),
    }),
    startDate: fields.startDate.greater('now').required().messages({
      'date.greater': 'Start date must be in the future',
    }),
    endDate: fields.endDate.greater(Joi.ref('startDate')).required().messages({
      'date.greater': 'End date must be after start date',
    }),
    capacity: fields.capacity.required(),
    price: fields.price.default(0),
    tags: fields.tags.default([]),
    status: Joi.string().valid('draft', 'published').default('published'),
  }),
};

export const updateEventSchema = {
  params: idParams,
  body: Joi.object(fields)
    .min(1)
    .messages({ 'object.min': 'Provide at least one field to update' }),
};

export const listEventsSchema = {
  query: Joi.object({
    ...pagination,
    search: Joi.string().trim().max(100).allow(''),
    category: Joi.string().valid(...EVENT_CATEGORIES),
    city: Joi.string().trim().max(80).allow(''),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    when: Joi.string().valid('upcoming', 'past', 'all').default('upcoming'),
    sort: Joi.string().valid('date', '-date', 'newest', 'popular', 'price').default('date'),
  }),
};

export const myEventsSchema = {
  query: Joi.object({
    ...pagination,
    limit: pagination.limit.max(100).default(20),
    status: Joi.string().valid(...EVENT_STATUSES),
  }),
};

export const eventIdSchema = { params: idParams };
