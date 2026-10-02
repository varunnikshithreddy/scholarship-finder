"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationPreferencesSchema = exports.updateProfileSchema = exports.userLoginSchema = exports.userRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.userRegistrationSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    terms_agreed: zod_1.z.boolean().refine(val => val === true, {
        message: 'You must agree to the Terms of Service and Privacy Policy'
    })
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.updateProfileSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2).max(100).optional(),
    country: zod_1.z.string().max(100).optional().nullable(),
    state: zod_1.z.string().max(100).optional().nullable(),
    nationality: zod_1.z.string().max(100).optional().nullable(),
    date_of_birth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
    education_level: zod_1.z.string().max(100).optional().nullable(),
    course: zod_1.z.string().max(150).optional().nullable(),
    discipline: zod_1.z.string().max(150).optional().nullable(),
    institution: zod_1.z.string().max(255).optional().nullable(),
    institution_type: zod_1.z.string().max(100).optional().nullable(),
    academic_year: zod_1.z.string().max(50).optional().nullable(),
    academic_score: zod_1.z.number().min(0).max(100).optional().nullable(),
    grading_scale: zod_1.z.enum(['percentage', 'cgpa_10', 'cgpa_4']).default('percentage').optional(),
    expected_graduation_year: zod_1.z.number().int().min(1900).max(2200).optional().nullable(),
    annual_family_income: zod_1.z.number().min(0).optional().nullable(),
    income_currency: zod_1.z.string().length(3).default('INR').optional()
});
exports.updateNotificationPreferencesSchema = zod_1.z.object({
    in_app_enabled: zod_1.z.boolean().optional(),
    email_enabled: zod_1.z.boolean().optional(),
    deadline_reminders_enabled: zod_1.z.boolean().optional(),
    opening_reminders_enabled: zod_1.z.boolean().optional(),
    scholarship_updates_enabled: zod_1.z.boolean().optional(),
    reminder_days: zod_1.z.array(zod_1.z.number().int().positive()).optional()
});
