import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '../src/services/ai/eligibilityEngine.service';
import { Scholarship, ScholarshipEligibilityCriterion } from '@scholarship-finder/shared';

describe('Eligibility Engine Unit Tests', () => {
  const mockScholarship: Scholarship = {
    id: 'mock-1',
    title: 'Merit Test Scholarship',
    slug: 'merit-test',
    description: 'A test scholarship',
    provider_id: 'p-1',
    status: 'published',
    verification_status: 'verified',
    education_levels: ['Undergraduate'],
    disciplines: ['Engineering'],
    eligible_countries: ['India'],
    eligible_states: [],
    eligible_nationalities: ['Indian'],
    funding_currency: 'INR',
    deadline_timezone: 'Asia/Kolkata',
    official_source_url: 'https://example.com',
    required_documents: [],
    source_metadata: {},
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockCriteria: ScholarshipEligibilityCriterion[] = [
    {
      id: 'crit-1',
      scholarship_id: 'mock-1',
      criterion_type: 'academic_score',
      operator: 'greater_than_or_equal',
      expected_value: { value: 75.0 },
      description: 'Minimum 75% in qualifying exam',
      is_mandatory: true,
      verification_status: 'verified',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'crit-2',
      scholarship_id: 'mock-1',
      criterion_type: 'annual_family_income',
      operator: 'less_than_or_equal',
      expected_value: { value: 600000 },
      description: 'Family income under 6 Lakh',
      is_mandatory: true,
      verification_status: 'verified',
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  it('determines likely_eligible when all criteria are satisfied', async () => {
    const result = await evaluateEligibility({
      scholarship: mockScholarship,
      criteria: mockCriteria,
      profile: {
        academic_score: 85,
        annual_family_income: 300000
      }
    });

    expect(result.status).toBe('likely_eligible');
    expect(result.matched_criteria.length).toBe(2);
    expect(result.unmatched_criteria.length).toBe(0);
    expect(result.missing_information.length).toBe(0);
  });

  it('determines likely_ineligible when mandatory score requirement is not met', async () => {
    const result = await evaluateEligibility({
      scholarship: mockScholarship,
      criteria: mockCriteria,
      profile: {
        academic_score: 65, // Below 75
        annual_family_income: 300000
      }
    });

    expect(result.status).toBe('likely_ineligible');
    expect(result.unmatched_criteria.length).toBe(1);
    expect(result.matched_criteria.length).toBe(1);
  });

  it('flags missing_information when income or score is unrecorded', async () => {
    const result = await evaluateEligibility({
      scholarship: mockScholarship,
      criteria: mockCriteria,
      profile: {
        academic_score: 80
        // annual_family_income is missing
      }
    });

    expect(result.status).toBe('potentially_eligible');
    expect(result.missing_information.length).toBe(1);
    expect(result.missing_information[0].field).toBe('annual_family_income');
  });
});
