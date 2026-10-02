import { Router } from 'express';
import * as controller from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateProfileSchema } from '@scholarship-finder/shared';

const router = Router();

router.use(requireAuth);

router.get('/', controller.getMyProfile);
router.patch('/', validateBody(updateProfileSchema), controller.updateMyProfile);
router.delete('/', controller.deleteMyAccount);

export default router;
