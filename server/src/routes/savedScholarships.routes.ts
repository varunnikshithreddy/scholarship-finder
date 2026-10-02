import { Router } from 'express';
import * as controller from '../controllers/savedScholarships.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { saveScholarshipSchema, updateSavedScholarshipSchema } from '@scholarship-finder/shared';

const router = Router();

router.use(requireAuth);

router.get('/', controller.listSaved);
router.post('/', validateBody(saveScholarshipSchema), controller.save);
router.patch('/:id', validateBody(updateSavedScholarshipSchema), controller.updateSaved);
router.delete('/:id', controller.removeSaved);

export default router;
