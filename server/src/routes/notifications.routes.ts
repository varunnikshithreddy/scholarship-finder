import { Router } from 'express';
import * as controller from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateNotificationPreferencesSchema } from '@scholarship-finder/shared';

const router = Router();

router.use(requireAuth);

router.get('/', controller.listNotifications);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);
router.get('/preferences', controller.getPreferences);
router.patch('/preferences', validateBody(updateNotificationPreferencesSchema), controller.updatePreferences);

export default router;
