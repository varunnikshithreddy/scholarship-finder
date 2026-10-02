import { z } from 'zod';

export const userRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  terms_agreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy'
  })
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  country: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
  education_level: z.string().max(100).optional().nullable(),
  course: z.string().max(150).optional().nullable(),
  discipline: z.string().max(150).optional().nullable(),
  institution: z.string().max(255).optional().nullable(),
  institution_type: z.string().max(100).optional().nullable(),
  academic_year: z.string().max(50).optional().nullable(),
  academic_score: z.number().min(0).max(100).optional().nullable(),
  grading_scale: z.enum(['percentage', 'cgpa_10', 'cgpa_4']).default('percentage').optional(),
  expected_graduation_year: z.number().int().min(1900).max(2200).optional().nullable(),
  annual_family_income: z.number().min(0).optional().nullable(),
  income_currency: z.string().length(3).default('INR').optional()
});

export const updateNotificationPreferencesSchema = z.object({
  in_app_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  deadline_reminders_enabled: z.boolean().optional(),
  opening_reminders_enabled: z.boolean().optional(),
  scholarship_updates_enabled: z.boolean().optional(),
  reminder_days: z.array(z.number().int().positive()).optional()
});
