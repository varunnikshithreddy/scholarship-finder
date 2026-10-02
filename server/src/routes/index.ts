import { Router } from 'express';
import scholarshipsRouter from './scholarships.routes';
import profileRouter from './profile.routes';
import eligibilityRouter from './eligibility.routes';
import recommendationsRouter from './recommendations.routes';
import savedScholarshipsRouter from './savedScholarships.routes';
import assistantRouter from './assistant.routes';
import notificationsRouter from './notifications.routes';
import adminRouter from './admin.routes';
import { listCategories, listProviders } from '../controllers/scholarships.controller';

const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Scholarship Finder API',
    version: '1.0.0'
  });
});

// Categories & Providers
apiRouter.get('/categories', listCategories);
apiRouter.get('/providers', listProviders);

// Feature modules
apiRouter.use('/scholarships', scholarshipsRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/eligibility', eligibilityRouter);
apiRouter.use('/recommendations', recommendationsRouter);
apiRouter.use('/saved-scholarships', savedScholarshipsRouter);
apiRouter.use('/ai', assistantRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/admin', adminRouter);

export default apiRouter;
