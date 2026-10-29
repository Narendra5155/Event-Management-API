import { Router } from 'express';
import * as users from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  listUsersSchema,
  myRegistrationsSchema,
  updateRoleSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me/registrations', validate(myRegistrationsSchema), users.myRegistrations);
router.get('/', authorize('admin'), validate(listUsersSchema), users.list);
router.patch('/:id/role', authorize('admin'), validate(updateRoleSchema), users.updateRole);

export default router;
