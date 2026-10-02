import { z } from 'zod';

export const documentRequirementSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200),
  description: z.string().max(500),
  is_mandatory: z.boolean().default(true),
  accepted_format: z.string().optional(),
  source_reference: z.string().optional()
});

export const scholarshipFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  education_level: z.string().optional(),
  discipline: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  min_funding: z.coerce.number().min(0).optional(),
  max_funding: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'pending_review', 'published', 'archived']).optional(),
  application_status: z.enum(['open', 'closing_soon', 'upcoming', 'closed']).optional(),
  sort_by: z.enum(['latest', 'deadline', 'funding_high', 'funding_low', 'relevance']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});

export const baseScholarshipSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with dashes'),
  short_description: z.string().max(500).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  provider_id: z.string().uuid('Invalid provider ID'),
  category_id: z.string().uuid('Invalid category ID').optional(),
  status: z.enum(['draft', 'pending_review', 'published', 'archived']).default('draft'),
  verification_status: z.enum(['unverified', 'pending', 'verified', 'rejected', 'needs_review']).default('unverified'),
  education_levels: z.array(z.string()).default([]),
  disciplines: z.array(z.string()).default([]),
  eligible_countries: z.array(z.string()).default(['India']),
  eligible_states: z.array(z.string()).default([]),
  eligible_nationalities: z.array(z.string()).default(['Indian']),
  funding_amount: z.number().min(0).optional().nullable(),
  funding_currency: z.string().length(3).default('INR'),
  funding_frequency: z.string().max(100).optional().nullable(),
  funding_coverage: z.string().max(255).optional().nullable(),
  application_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
  application_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
  deadline_timezone: z.string().default('Asia/Kolkata'),
  official_application_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  official_source_url: z.string().url('Must be a valid official source URL'),
  selection_process: z.string().optional().nullable(),
  renewal_conditions: z.string().optional().nullable(),
  application_instructions: z.string().optional().nullable(),
  required_documents: z.array(documentRequirementSchema).default([]),
  is_featured: z.boolean().default(false)
});

export const createScholarshipSchema = baseScholarshipSchema.refine(data => {
  if (data.application_start_date && data.application_deadline) {
    return new Date(data.application_start_date) <= new Date(data.application_deadline);
  }
  return true;
}, {
  message: 'Application start date must be before or equal to deadline',
  path: ['application_start_date']
});

export const updateScholarshipSchema = baseScholarshipSchema.partial();

export const eligibilityCriterionSchema = z.object({
  criterion_type: z.string().min(1),
  operator: z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'in',
    'contains',
    'between'
  ]),
  expected_value: z.any(),
  description: z.string().max(500).optional(),
  source_text: z.string().max(1000).optional(),
  is_mandatory: z.boolean().default(true),
  display_order: z.number().int().default(0)
});

export const saveScholarshipSchema = z.object({
  scholarship_id: z.string().uuid(),
  application_status: z.enum([
    'interested',
    'planning_to_apply',
    'in_progress',
    'submitted',
    'awarded',
    'not_selected',
    'no_longer_interested'
  ]).default('interested'),
  personal_note: z.string().max(1000).optional()
});

export const updateSavedScholarshipSchema = z.object({
  application_status: z.enum([
    'interested',
    'planning_to_apply',
    'in_progress',
    'submitted',
    'awarded',
    'not_selected',
    'no_longer_interested'
  ]).optional(),
  personal_note: z.string().max(1000).optional()
});

export const reportScholarshipSchema = z.object({
  scholarship_id: z.string().uuid(),
  report_type: z.string().min(2).max(100),
  description: z.string().min(10, 'Please provide more details').max(2000)
});
