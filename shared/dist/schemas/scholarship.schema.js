"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportScholarshipSchema = exports.updateSavedScholarshipSchema = exports.saveScholarshipSchema = exports.eligibilityCriterionSchema = exports.updateScholarshipSchema = exports.createScholarshipSchema = exports.baseScholarshipSchema = exports.scholarshipFilterSchema = exports.documentRequirementSchema = void 0;
const zod_1 = require("zod");
exports.documentRequirementSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Document name is required').max(200),
    description: zod_1.z.string().max(500),
    is_mandatory: zod_1.z.boolean().default(true),
    accepted_format: zod_1.z.string().optional(),
    source_reference: zod_1.z.string().optional()
});
exports.scholarshipFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    education_level: zod_1.z.string().optional(),
    discipline: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    min_funding: zod_1.z.coerce.number().min(0).optional(),
    max_funding: zod_1.z.coerce.number().min(0).optional(),
    status: zod_1.z.enum(['draft', 'pending_review', 'published', 'archived']).optional(),
    application_status: zod_1.z.enum(['open', 'closing_soon', 'upcoming', 'closed']).optional(),
    sort_by: zod_1.z.enum(['latest', 'deadline', 'funding_high', 'funding_low', 'relevance']).default('latest'),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(50).default(12)
});
exports.baseScholarshipSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters').max(255),
    slug: zod_1.z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with dashes'),
    short_description: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().min(20, 'Description must be at least 20 characters'),
    provider_id: zod_1.z.string().uuid('Invalid provider ID'),
    category_id: zod_1.z.string().uuid('Invalid category ID').optional(),
    status: zod_1.z.enum(['draft', 'pending_review', 'published', 'archived']).default('draft'),
    verification_status: zod_1.z.enum(['unverified', 'pending', 'verified', 'rejected', 'needs_review']).default('unverified'),
    education_levels: zod_1.z.array(zod_1.z.string()).default([]),
    disciplines: zod_1.z.array(zod_1.z.string()).default([]),
    eligible_countries: zod_1.z.array(zod_1.z.string()).default(['India']),
    eligible_states: zod_1.z.array(zod_1.z.string()).default([]),
    eligible_nationalities: zod_1.z.array(zod_1.z.string()).default(['Indian']),
    funding_amount: zod_1.z.number().min(0).optional().nullable(),
    funding_currency: zod_1.z.string().length(3).default('INR'),
    funding_frequency: zod_1.z.string().max(100).optional().nullable(),
    funding_coverage: zod_1.z.string().max(255).optional().nullable(),
    application_start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
    application_deadline: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
    deadline_timezone: zod_1.z.string().default('Asia/Kolkata'),
    official_application_url: zod_1.z.string().url('Must be a valid URL').optional().nullable().or(zod_1.z.literal('')),
    official_source_url: zod_1.z.string().url('Must be a valid official source URL'),
    selection_process: zod_1.z.string().optional().nullable(),
    renewal_conditions: zod_1.z.string().optional().nullable(),
    application_instructions: zod_1.z.string().optional().nullable(),
    required_documents: zod_1.z.array(exports.documentRequirementSchema).default([]),
    is_featured: zod_1.z.boolean().default(false)
});
exports.createScholarshipSchema = exports.baseScholarshipSchema.refine(data => {
    if (data.application_start_date && data.application_deadline) {
        return new Date(data.application_start_date) <= new Date(data.application_deadline);
    }
    return true;
}, {
    message: 'Application start date must be before or equal to deadline',
    path: ['application_start_date']
});
exports.updateScholarshipSchema = exports.baseScholarshipSchema.partial();
exports.eligibilityCriterionSchema = zod_1.z.object({
    criterion_type: zod_1.z.string().min(1),
    operator: zod_1.z.enum([
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
    expected_value: zod_1.z.any(),
    description: zod_1.z.string().max(500).optional(),
    source_text: zod_1.z.string().max(1000).optional(),
    is_mandatory: zod_1.z.boolean().default(true),
    display_order: zod_1.z.number().int().default(0)
});
exports.saveScholarshipSchema = zod_1.z.object({
    scholarship_id: zod_1.z.string().uuid(),
    application_status: zod_1.z.enum([
        'interested',
        'planning_to_apply',
        'in_progress',
        'submitted',
        'awarded',
        'not_selected',
        'no_longer_interested'
    ]).default('interested'),
    personal_note: zod_1.z.string().max(1000).optional()
});
exports.updateSavedScholarshipSchema = zod_1.z.object({
    application_status: zod_1.z.enum([
        'interested',
        'planning_to_apply',
        'in_progress',
        'submitted',
        'awarded',
        'not_selected',
        'no_longer_interested'
    ]).optional(),
    personal_note: zod_1.z.string().max(1000).optional()
});
exports.reportScholarshipSchema = zod_1.z.object({
    scholarship_id: zod_1.z.string().uuid(),
    report_type: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().min(10, 'Please provide more details').max(2000)
});
