import { Router } from 'express';
import * as controller from '../controllers/recommendations.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', controller.getRecommendations);
router.post('/refresh', controller.getRecommendations);

export default router;
