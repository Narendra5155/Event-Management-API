import { Router } from 'express';
import * as events from '../controllers/event.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createEventSchema,
  eventIdSchema,
  listEventsSchema,
  myEventsSchema,
  updateEventSchema,
} from '../validators/event.validator.js';

const router = Router();
const canOrganize = [authenticate, authorize('organizer', 'admin')];

router.get('/', validate(listEventsSchema), events.list);
router.get('/mine', ...canOrganize, validate(myEventsSchema), events.mine);
router.post('/', ...canOrganize, validate(createEventSchema), events.create);

router.get('/:id', optionalAuth, validate(eventIdSchema), events.get);
router.patch('/:id', ...canOrganize, validate(updateEventSchema), events.update);
router.delete('/:id', ...canOrganize, validate(eventIdSchema), events.remove);

router.post('/:id/register', authenticate, validate(eventIdSchema), events.register);
router.delete('/:id/register', authenticate, validate(eventIdSchema), events.cancelRegistration);
router.get('/:id/attendees', ...canOrganize, validate(eventIdSchema), events.attendees);

export default router;
