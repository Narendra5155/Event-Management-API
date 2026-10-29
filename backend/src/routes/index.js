import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } }));
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/users', userRoutes);

export default router;
