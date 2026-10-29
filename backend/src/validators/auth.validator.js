import Joi from 'joi';

const email = Joi.string().trim().lowercase().email().max(254);

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    email: email.required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter and one number',
      }),
    // Admins are created by seed or promoted by another admin — never self-assigned.
    role: Joi.string().valid('attendee', 'organizer').default('attendee'),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: email.required(),
    password: Joi.string().max(128).required(),
  }),
};
