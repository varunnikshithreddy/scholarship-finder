import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import * as scholarshipService from '../services/scholarships.service';
import * as profileService from '../services/profile.service';
import { evaluateEligibility } from '../services/ai/eligibilityEngine.service';

export async function checkEligibility(req: Request, res: Response, next: NextFunction) {
  try {
    const { scholarship_id, profile_override } = req.body;

    const scholarship = await scholarshipService.getScholarshipById(scholarship_id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Scholarship not found',
        },
      });
    }

    let userProfile: any = {};
    if (req.user) {
      const stored = await profileService.getProfile(req.user.id);
      if (stored) userProfile = stored;
    }

    // Merge profile override if provided
    const mergedProfile = {
      ...userProfile,
      ...(profile_override || {}),
    };

    const criteria = scholarship.criteria || [];
    const assessment = await evaluateEligibility({
      scholarship,
      criteria,
      profile: mergedProfile,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('eligibility_assessments')
      .select(`
        *,
        scholarship:scholarships(id, title, slug, funding_amount, funding_currency, application_deadline)
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('eligibility_assessments')
      .select(`
        *,
        scholarship:scholarships(*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assessment record not found',
        },
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
