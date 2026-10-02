import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Student profile not found',
        },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await profileService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await profileService.deleteProfile(req.user!.id);
    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
