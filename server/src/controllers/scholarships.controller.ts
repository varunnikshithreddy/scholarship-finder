import { Request, Response, NextFunction } from 'express';
import * as scholarshipService from '../services/scholarships.service';
import { ApiResponse } from '@scholarship-finder/shared';

export async function listScholarships(req: Request, res: Response, next: NextFunction) {
  try {
    const { scholarships, meta } = await scholarshipService.getScholarships(req.query as any);
    const response: ApiResponse = {
      success: true,
      data: scholarships,
      meta,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function getLatest(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const scholarships = await scholarshipService.getLatestScholarships(limit);
    res.json({
      success: true,
      data: scholarships,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const scholarships = await scholarshipService.getFeaturedScholarships(limit);
    res.json({
      success: true,
      data: scholarships,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const scholarship = await scholarshipService.getScholarshipById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Scholarship not found or unavailable',
        },
      });
    }

    res.json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRelated(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
    const related = await scholarshipService.getRelatedScholarships(req.params.id, limit);
    res.json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await scholarshipService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function listProviders(_req: Request, res: Response, next: NextFunction) {
  try {
    const providers = await scholarshipService.getProviders();
    res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
}
