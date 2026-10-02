import { supabaseAdmin } from '../../config/supabase';
import { callGemini, isGeminiConfigured } from './gemini.service';
import {
  Scholarship,
  ScholarshipEligibilityCriterion,
  Profile,
  EligibilityAssessmentResult,
  MatchedCriterion,
  UnmatchedCriterion,
  MissingInformationItem,
  EligibilityStatus,
  aiEligibilityAssessmentSchema
} from '@scholarship-finder/shared';

interface EvaluateInput {
  scholarship: Scholarship;
  criteria: ScholarshipEligibilityCriterion[];
  profile: Partial<Profile>;
  userId?: string;
}

export async function evaluateEligibility({
  scholarship,
  criteria,
  profile,
  userId
}: EvaluateInput): Promise<EligibilityAssessmentResult> {
  const matched: MatchedCriterion[] = [];
  const unmatched: UnmatchedCriterion[] = [];
  const missing: MissingInformationItem[] = [];

  for (const crit of criteria) {
    const type = crit.criterion_type;
    const operator = crit.operator;
    const expected = crit.expected_value;

    switch (type) {
      case 'academic_score': {
        const studentScore = profile.academic_score;
        if (studentScore === null || studentScore === undefined) {
          missing.push({
            criterion_id: crit.id,
            field: 'academic_score',
            reason: `Academic performance requirement (${crit.description || 'score threshold'}) requires your GPA or percentage.`
          });
          break;
        }

        const requiredScore = typeof expected === 'number' ? expected : expected?.value;
        let isMatch = false;

        if (operator === 'greater_than_or_equal') isMatch = studentScore >= requiredScore;
        else if (operator === 'greater_than') isMatch = studentScore > requiredScore;
        else if (operator === 'equals') isMatch = studentScore === requiredScore;
        else isMatch = studentScore >= requiredScore;

        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Minimum Academic Score',
            student_value: `${studentScore}%`,
            required_value: `${requiredScore}%`,
            explanation: `Your reported academic score of ${studentScore}% satisfies the minimum requirement of ${requiredScore}%.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Minimum Academic Score',
            student_value: `${studentScore}%`,
            required_value: `${requiredScore}%`,
            explanation: `Your score of ${studentScore}% does not meet the specified threshold of ${requiredScore}%.`
          });
        }
        break;
      }

      case 'annual_family_income': {
        const studentIncome = profile.annual_family_income;
        if (studentIncome === null || studentIncome === undefined) {
          missing.push({
            criterion_id: crit.id,
            field: 'annual_family_income',
            reason: `Income ceiling requirement (${crit.description || 'household income threshold'}) requires your family income.`
          });
          break;
        }

        const maxIncome = typeof expected === 'number' ? expected : expected?.value;
        let isMatch = false;

        if (operator === 'less_than_or_equal') isMatch = studentIncome <= maxIncome;
        else if (operator === 'less_than') isMatch = studentIncome < maxIncome;
        else if (operator === 'equals') isMatch = studentIncome === maxIncome;
        else isMatch = studentIncome <= maxIncome;

        const formattedStudent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(studentIncome);
        const formattedRequired = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(maxIncome);

        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Maximum Family Income Limit',
            student_value: formattedStudent,
            required_value: formattedRequired,
            explanation: `Your household income (${formattedStudent}) is within the allowable limit of ${formattedRequired}.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Maximum Family Income Limit',
            student_value: formattedStudent,
            required_value: formattedRequired,
            explanation: `Your reported income (${formattedStudent}) exceeds the maximum eligible limit of ${formattedRequired}.`
          });
        }
        break;
      }

      case 'education_level': {
        const studentLevel = profile.education_level;
        if (!studentLevel) {
          missing.push({
            criterion_id: crit.id,
            field: 'education_level',
            reason: 'Current education level is needed to check qualification eligibility.'
          });
          break;
        }

        const allowedLevels: string[] = Array.isArray(expected) ? expected : expected?.values || [];
        const isMatch = allowedLevels.some(lvl => lvl.toLowerCase() === studentLevel.toLowerCase());

        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Education Level',
            student_value: studentLevel,
            required_value: allowedLevels.join(', '),
            explanation: `Your current education level (${studentLevel}) matches the eligible courses.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Education Level',
            student_value: studentLevel,
            required_value: allowedLevels.join(', '),
            explanation: `Education level ${studentLevel} is not listed in the accepted levels (${allowedLevels.join(', ')}).`
          });
        }
        break;
      }

      case 'discipline': {
        const studentDiscipline = profile.discipline;
        if (!studentDiscipline) {
          missing.push({
            criterion_id: crit.id,
            field: 'discipline',
            reason: 'Academic stream or discipline is required.'
          });
          break;
        }

        const allowedDisciplines: string[] = Array.isArray(expected) ? expected : expected?.values || [];
        const isMatch = allowedDisciplines.some(d => d.toLowerCase() === studentDiscipline.toLowerCase());

        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Academic Discipline',
            student_value: studentDiscipline,
            required_value: allowedDisciplines.join(', '),
            explanation: `Your field of study (${studentDiscipline}) is eligible under this program.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || 'Academic Discipline',
            student_value: studentDiscipline,
            required_value: allowedDisciplines.join(', '),
            explanation: `This opportunity is targeted towards: ${allowedDisciplines.join(', ')}.`
          });
        }
        break;
      }

      default: {
        // Generic criterion
        matched.push({
          criterion_id: crit.id,
          criterion: crit.description || crit.criterion_type,
          student_value: 'Reported',
          required_value: 'Documented',
          explanation: crit.source_text || 'Documented criterion.'
        });
        break;
      }
    }
  }

  // Calculate baseline status deterministically
  const totalCriteria = criteria.length || 1;
  const evaluatedCount = matched.length + unmatched.length;
  const confidenceCompleteness = Math.round((evaluatedCount / totalCriteria) * 100);

  let status: EligibilityStatus = 'potentially_eligible';

  const hasMandatoryUnmatched = unmatched.some(u => {
    const criterion = criteria.find(c => c.id === u.criterion_id);
    return criterion?.is_mandatory ?? true;
  });

  if (hasMandatoryUnmatched) {
    status = 'likely_ineligible';
  } else if (missing.length > 0 && matched.length === 0) {
    status = 'insufficient_information';
  } else if (missing.length > 0 && matched.length > 0) {
    status = 'potentially_eligible';
  } else if (unmatched.length === 0 && matched.length > 0) {
    status = 'likely_eligible';
  }

  let finalExplanation = `Based on the provided information, ${matched.length} criteria matched, ${unmatched.length} did not match, and ${missing.length} criteria require additional verification.`;
  let nextSteps: string[] = [
    'Review the official scholarship notification to confirm supporting documents.',
    'Keep your income certificate and academic transcripts updated.',
    'Apply before the official deadline on the designated application portal.'
  ];

  // If Gemini is available, enhance with AI advisory narrative
  if (isGeminiConfigured()) {
    try {
      const prompt = `
Task: Generate an evidence-based, transparent explanation of this scholarship eligibility evaluation.

Scholarship Title: ${scholarship.title}
Status: ${status}
Matched Criteria: ${JSON.stringify(matched)}
Unmatched Criteria: ${JSON.stringify(unmatched)}
Missing Information: ${JSON.stringify(missing)}

Output valid JSON matching this schema:
{
  "explanation": "Clear, student-friendly 2-3 sentence overview explaining why they are ${status} based strictly on the matched/unmatched facts.",
  "next_steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
}
`;

      const aiResponse = await callGemini(prompt);
      if (aiResponse) {
        const parsed = JSON.parse(aiResponse);
        if (parsed.explanation) finalExplanation = parsed.explanation;
        if (Array.isArray(parsed.next_steps)) nextSteps = parsed.next_steps;
      }
    } catch (err) {
      console.warn('[Eligibility Engine] Gemini enhancement fallback:', err);
    }
  }

  const result: EligibilityAssessmentResult = {
    scholarship_id: scholarship.id,
    user_id: userId,
    status,
    matched_criteria: matched,
    unmatched_criteria: unmatched,
    missing_information: missing,
    explanation: finalExplanation,
    confidence_completeness: confidenceCompleteness,
    next_steps: nextSteps,
    disclaimer: 'This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider\'s official website before applying.',
    created_at: new Date().toISOString()
  };

  // If authenticated user, persist assessment in database
  if (userId) {
    try {
      const { data: inserted } = await supabaseAdmin
        .from('eligibility_assessments')
        .insert({
          user_id: userId,
          scholarship_id: scholarship.id,
          status,
          matched_criteria: matched,
          unmatched_criteria: unmatched,
          missing_information: missing,
          explanation: finalExplanation,
          confidence_completeness: confidenceCompleteness,
          model_name: isGeminiConfigured() ? 'gemini-2.5-flash' : 'rule_engine_v1',
          prompt_version: 'v1.0'
        })
        .select('id')
        .single();

      if (inserted) {
        result.id = inserted.id;
      }
    } catch (dbErr) {
      console.warn('[Eligibility Engine] Could not save assessment to database:', dbErr);
    }
  }

  return result;
}
