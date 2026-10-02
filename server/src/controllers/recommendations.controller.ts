import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';
import { getPersonalizedRecommendations } from '../services/ai/recommendations.service';

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Please complete your student profile to view tailored recommendations.',
        },
      });
    }

    const recommendations = await getPersonalizedRecommendations(profile);
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}
