"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiChatResponseSchema = exports.aiChatRequestSchema = exports.aiEligibilityAssessmentSchema = exports.checkEligibilityRequestSchema = void 0;
const zod_1 = require("zod");
exports.checkEligibilityRequestSchema = zod_1.z.object({
    scholarship_id: zod_1.z.string().uuid('Invalid scholarship ID'),
    profile_override: zod_1.z.object({
        education_level: zod_1.z.string().optional(),
        discipline: zod_1.z.string().optional(),
        academic_score: zod_1.z.number().min(0).max(100).optional(),
        annual_family_income: zod_1.z.number().min(0).optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        nationality: zod_1.z.string().optional()
    }).optional()
});
exports.aiEligibilityAssessmentSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'likely_eligible',
        'potentially_eligible',
        'likely_ineligible',
        'insufficient_information'
    ]),
    matched_criteria: zod_1.z.array(zod_1.z.object({
        criterion_id: zod_1.z.string(),
        criterion: zod_1.z.string(),
        student_value: zod_1.z.any(),
        required_value: zod_1.z.any(),
        explanation: zod_1.z.string()
    })).default([]),
    unmatched_criteria: zod_1.z.array(zod_1.z.object({
        criterion_id: zod_1.z.string(),
        criterion: zod_1.z.string(),
        student_value: zod_1.z.any(),
        required_value: zod_1.z.any(),
        explanation: zod_1.z.string()
    })).default([]),
    missing_information: zod_1.z.array(zod_1.z.object({
        criterion_id: zod_1.z.string().optional(),
        field: zod_1.z.string(),
        reason: zod_1.z.string()
    })).default([]),
    explanation: zod_1.z.string(),
    confidence_completeness: zod_1.z.number().min(0).max(100).default(50),
    next_steps: zod_1.z.array(zod_1.z.string()).default([]),
    disclaimer: zod_1.z.string().default('This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider\'s official website before applying.')
});
exports.aiChatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty').max(1000),
    scholarship_id: zod_1.z.string().uuid().optional(),
    conversation_history: zod_1.z.array(zod_1.z.object({
        sender: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string().max(2000)
    })).max(10).optional().default([])
});
exports.aiChatResponseSchema = zod_1.z.object({
    answer: zod_1.z.string(),
    source_references: zod_1.z.array(zod_1.z.object({
        scholarship_id: zod_1.z.string(),
        title: zod_1.z.string(),
        source_url: zod_1.z.string()
    })).default([]),
    related_scholarship_ids: zod_1.z.array(zod_1.z.string()).default([]),
    needs_clarification: zod_1.z.boolean().default(false),
    clarification_question: zod_1.z.string().nullable().optional(),
    information_limitations: zod_1.z.array(zod_1.z.string()).default([])
});
