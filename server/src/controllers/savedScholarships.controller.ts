import { Request, Response, NextFunction } from 'express';
import * as savedService from '../services/savedScholarships.service';

export async function listSaved(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await savedService.getSavedScholarships(req.user!.id);
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

export async function save(req: Request, res: Response, next: NextFunction) {
  try {
    const { scholarship_id, application_status, personal_note } = req.body;
    const saved = await savedService.saveScholarship(
      req.user!.id,
      scholarship_id,
      application_status,
      personal_note
    );

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Scholarship saved to your list',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSaved(req: Request, res: Response, next: NextFunction) {
  try {
    const { application_status, personal_note } = req.body;
    const updated = await savedService.updateSavedScholarship(
      req.user!.id,
      req.params.id,
      application_status,
      personal_note
    );

    res.json({
      success: true,
      data: updated,
      message: 'Application status updated',
    });
  } catch (error) {
    next(error);
  }
}

export async function removeSaved(req: Request, res: Response, next: NextFunction) {
  try {
    await savedService.removeSavedScholarship(req.user!.id, req.params.id);
    res.json({
      success: true,
      message: 'Scholarship removed from saved list',
    });
  } catch (error) {
    next(error);
  }
}
