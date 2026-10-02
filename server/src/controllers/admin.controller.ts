import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export async function getOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await adminService.getAdminOverview();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
}

export async function listScholarships(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const search = req.query.search as string;

    const result = await adminService.getAllScholarshipsAdmin(page, pageSize, search);
    res.json({
      success: true,
      data: result.scholarships,
      meta: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
        hasNextPage: page < Math.ceil(result.total / pageSize),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await adminService.createScholarshipAdmin(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Scholarship created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await adminService.updateScholarshipAdmin(req.params.id, req.body, req.user!.id);
    res.json({
      success: true,
      data: updated,
      message: 'Scholarship updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const archived = await adminService.archiveScholarshipAdmin(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: archived,
      message: 'Scholarship archived',
    });
  } catch (error) {
    next(error);
  }
}

export async function publishScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const published = await adminService.publishScholarshipAdmin(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: published,
      message: 'Scholarship published to public directory',
    });
  } catch (error) {
    next(error);
  }
}

export async function unpublishScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const unpublished = await adminService.unpublishScholarshipAdmin(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: unpublished,
      message: 'Scholarship unpublished and moved to draft',
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const { verification_status, notes } = req.body;
    const verified = await adminService.verifyScholarshipAdmin(
      req.params.id,
      verification_status,
      notes,
      req.user!.id
    );

    res.json({
      success: true,
      data: verified,
      message: 'Scholarship verification status updated',
    });
  } catch (error) {
    next(error);
  }
}

export async function listReports(_req: Request, res: Response, next: NextFunction) {
  try {
    const reports = await adminService.getReportsAdmin();
    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const updated = await adminService.updateReportStatusAdmin(req.params.id, status, req.user!.id);
    res.json({
      success: true,
      data: updated,
      message: 'Report status updated',
    });
  } catch (error) {
    next(error);
  }
}

export async function listAuditLogs(_req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await adminService.getAuditLogsAdmin();
    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}
