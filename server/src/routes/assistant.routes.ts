import { Router } from 'express';
import * as controller from '../controllers/assistant.controller';
import { validateBody } from '../middleware/validate.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { aiChatRequestSchema } from '@scholarship-finder/shared';

const router = Router();

router.post('/chat', aiRateLimiter, validateBody(aiChatRequestSchema), controller.chat);

export default router;
