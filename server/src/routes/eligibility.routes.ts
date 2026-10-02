import { Router } from 'express';
import * as controller from '../controllers/eligibility.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { checkEligibilityRequestSchema } from '@scholarship-finder/shared';

const router = Router();

// Guest or authenticated students can run eligibility checker
router.post('/check', optionalAuth, aiRateLimiter, validateBody(checkEligibilityRequestSchema), controller.checkEligibility);

// History requires authentication
router.get('/history', requireAuth, controller.getAssessmentHistory);
router.get('/:id', requireAuth, controller.getAssessmentById);

export default router;
