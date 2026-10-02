import { supabaseAdmin } from '../../config/supabase';
import { Profile, Scholarship, RecommendationItem } from '@scholarship-finder/shared';

export async function getPersonalizedRecommendations(userProfile: Profile): Promise<RecommendationItem[]> {
  // Fetch published scholarships with providers
  const { data: scholarships, error } = await supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(name, official_website),
      category:scholarship_categories(name),
      criteria:scholarship_eligibility_criteria(*)
    `)
    .eq('status', 'published')
    .order('application_deadline', { ascending: true });

  if (error || !scholarships) {
    console.error('[Recommendations Service] Query error:', error);
    return [];
  }

  const recommendations: { item: RecommendationItem; score: number }[] = [];

  for (const s of scholarships) {
    const reasons: string[] = [];
    const matchedCriteria: string[] = [];
    const missingInfo: string[] = [];
    let matchScore = 0;

    // 1. Education Level Match
    if (userProfile.education_level && Array.isArray(s.education_levels) && s.education_levels.length > 0) {
      const match = s.education_levels.some(
        (lvl: string) => lvl.toLowerCase() === userProfile.education_level?.toLowerCase()
      );
      if (match) {
        matchScore += 30;
        reasons.push(`Matches your current education level (${userProfile.education_level})`);
        matchedCriteria.push('education_level');
      }
    } else if (!userProfile.education_level) {
      missingInfo.push('education_level');
    }

    // 2. Discipline / Course Match
    if (userProfile.discipline && Array.isArray(s.disciplines) && s.disciplines.length > 0) {
      const match = s.disciplines.some(
        (d: string) => d.toLowerCase() === userProfile.discipline?.toLowerCase()
      );
      if (match) {
        matchScore += 25;
        reasons.push(`Supports students in ${userProfile.discipline}`);
        matchedCriteria.push('discipline');
      }
    } else if (!userProfile.discipline) {
      missingInfo.push('discipline');
    }

    // 3. Criteria checks (Academic Score & Income)
    if (Array.isArray(s.criteria)) {
      for (const crit of s.criteria) {
        if (crit.criterion_type === 'academic_score' && userProfile.academic_score !== null && userProfile.academic_score !== undefined) {
          const req = crit.expected_value?.value || crit.expected_value;
          if (userProfile.academic_score >= req) {
            matchScore += 20;
            reasons.push(`Academic score (${userProfile.academic_score}%) meets requirement (${req}%)`);
            matchedCriteria.push('academic_score');
          }
        }

        if (crit.criterion_type === 'annual_family_income' && userProfile.annual_family_income !== null && userProfile.annual_family_income !== undefined) {
          const maxInc = crit.expected_value?.value || crit.expected_value;
          if (userProfile.annual_family_income <= maxInc) {
            matchScore += 20;
            reasons.push(`Income criteria satisfied (below allowable limit)`);
            matchedCriteria.push('annual_family_income');
          }
        }
      }
    }

    // 4. Deadline evaluation
    let appStatus = 'open';
    const now = new Date();
    if (s.application_deadline) {
      const deadline = new Date(s.application_deadline);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        appStatus = 'closed';
        continue; // Do not recommend expired scholarships
      } else if (diffDays <= 7) {
        appStatus = 'closing_soon';
        matchScore += 10; // Prioritize imminent opportunities
      } else {
        appStatus = 'open';
      }
    }

    // Only recommend scholarships with relevant match or general eligibility
    if (matchScore >= 20 || (!userProfile.education_level && !userProfile.discipline)) {
      recommendations.push({
        score: matchScore,
        item: {
          scholarship_id: s.id,
          scholarship_title: s.title,
          provider_name: s.provider?.name || 'Verified Organization',
          funding_amount: s.funding_amount,
          application_deadline: s.application_deadline,
          reasons: reasons.length > 0 ? reasons : ['General student financial assistance opportunity'],
          matched_criteria: matchedCriteria,
          missing_information: missingInfo,
          application_status: appStatus,
          explanation: `This scholarship is recommended based on your verified academic profile parameters.`,
          official_source_url: s.official_source_url
        }
      });
    }
  }

  // Sort by match score descending
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.map(r => r.item);
}
