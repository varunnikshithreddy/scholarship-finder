import { z } from 'zod';

export const checkEligibilityRequestSchema = z.object({
  scholarship_id: z.string().uuid('Invalid scholarship ID'),
  profile_override: z.object({
    education_level: z.string().optional(),
    discipline: z.string().optional(),
    academic_score: z.number().min(0).max(100).optional(),
    annual_family_income: z.number().min(0).optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    nationality: z.string().optional()
  }).optional()
});

export const aiEligibilityAssessmentSchema = z.object({
  status: z.enum([
    'likely_eligible',
    'potentially_eligible',
    'likely_ineligible',
    'insufficient_information'
  ]),
  matched_criteria: z.array(z.object({
    criterion_id: z.string(),
    criterion: z.string(),
    student_value: z.any(),
    required_value: z.any(),
    explanation: z.string()
  })).default([]),
  unmatched_criteria: z.array(z.object({
    criterion_id: z.string(),
    criterion: z.string(),
    student_value: z.any(),
    required_value: z.any(),
    explanation: z.string()
  })).default([]),
  missing_information: z.array(z.object({
    criterion_id: z.string().optional(),
    field: z.string(),
    reason: z.string()
  })).default([]),
  explanation: z.string(),
  confidence_completeness: z.number().min(0).max(100).default(50),
  next_steps: z.array(z.string()).default([]),
  disclaimer: z.string().default('This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider\'s official website before applying.')
});

export const aiChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000),
  scholarship_id: z.string().uuid().optional(),
  conversation_history: z.array(z.object({
    sender: z.enum(['user', 'assistant']),
    content: z.string().max(2000)
  })).max(10).optional().default([])
});

export const aiChatResponseSchema = z.object({
  answer: z.string(),
  source_references: z.array(z.object({
    scholarship_id: z.string(),
    title: z.string(),
    source_url: z.string()
  })).default([]),
  related_scholarship_ids: z.array(z.string()).default([]),
  needs_clarification: z.boolean().default(false),
  clarification_question: z.string().nullable().optional(),
  information_limitations: z.array(z.string()).default([])
});
