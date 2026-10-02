import { Router } from 'express';
import * as controller from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createScholarshipSchema, updateScholarshipSchema } from '@scholarship-finder/shared';

const router = Router();

router.use(requireAdmin);

router.get('/overview', controller.getOverview);
router.get('/scholarships', controller.listScholarships);
router.post('/scholarships', validateBody(createScholarshipSchema), controller.createScholarship);
router.patch('/scholarships/:id', validateBody(updateScholarshipSchema), controller.updateScholarship);
router.delete('/scholarships/:id', controller.archiveScholarship);
router.post('/scholarships/:id/publish', controller.publishScholarship);
router.post('/scholarships/:id/unpublish', controller.unpublishScholarship);
router.post('/scholarships/:id/verify', controller.verifyScholarship);

router.get('/reports', controller.listReports);
router.patch('/reports/:id', controller.updateReport);
router.get('/audit-logs', controller.listAuditLogs);

export default router;
