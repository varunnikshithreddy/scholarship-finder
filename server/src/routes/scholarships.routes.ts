import { Router } from 'express';
import * as controller from '../controllers/scholarships.controller';
import { validateQuery } from '../middleware/validate.middleware';
import { scholarshipFilterSchema } from '@scholarship-finder/shared';

const router = Router();

router.get('/', validateQuery(scholarshipFilterSchema), controller.listScholarships);
router.get('/latest', controller.getLatest);
router.get('/featured', controller.getFeatured);
router.get('/:id', controller.getDetails);
router.get('/:id/related', controller.getRelated);

export default router;
