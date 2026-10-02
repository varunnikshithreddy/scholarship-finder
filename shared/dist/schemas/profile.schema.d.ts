import { z } from 'zod';
export declare const userRegistrationSchema: z.ZodObject<{
    full_name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    terms_agreed: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    full_name: string;
    password: string;
    terms_agreed: boolean;
}, {
    email: string;
    full_name: string;
    password: string;
    terms_agreed: boolean;
}>;
export declare const userLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    full_name: z.ZodOptional<z.ZodString>;
    country: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nationality: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    date_of_birth: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    education_level: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    course: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    discipline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    institution: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    institution_type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    academic_year: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    academic_score: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    grading_scale: z.ZodOptional<z.ZodDefault<z.ZodEnum<["percentage", "cgpa_10", "cgpa_4"]>>>;
    expected_graduation_year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    annual_family_income: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    income_currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    education_level?: string | null | undefined;
    discipline?: string | null | undefined;
    country?: string | null | undefined;
    state?: string | null | undefined;
    full_name?: string | undefined;
    nationality?: string | null | undefined;
    date_of_birth?: string | null | undefined;
    course?: string | null | undefined;
    institution?: string | null | undefined;
    institution_type?: string | null | undefined;
    academic_year?: string | null | undefined;
    academic_score?: number | null | undefined;
    grading_scale?: "percentage" | "cgpa_10" | "cgpa_4" | undefined;
    expected_graduation_year?: number | null | undefined;
    annual_family_income?: number | null | undefined;
    income_currency?: string | undefined;
}, {
    education_level?: string | null | undefined;
    discipline?: string | null | undefined;
    country?: string | null | undefined;
    state?: string | null | undefined;
    full_name?: string | undefined;
    nationality?: string | null | undefined;
    date_of_birth?: string | null | undefined;
    course?: string | null | undefined;
    institution?: string | null | undefined;
    institution_type?: string | null | undefined;
    academic_year?: string | null | undefined;
    academic_score?: number | null | undefined;
    grading_scale?: "percentage" | "cgpa_10" | "cgpa_4" | undefined;
    expected_graduation_year?: number | null | undefined;
    annual_family_income?: number | null | undefined;
    income_currency?: string | undefined;
}>;
export declare const updateNotificationPreferencesSchema: z.ZodObject<{
    in_app_enabled: z.ZodOptional<z.ZodBoolean>;
    email_enabled: z.ZodOptional<z.ZodBoolean>;
    deadline_reminders_enabled: z.ZodOptional<z.ZodBoolean>;
    opening_reminders_enabled: z.ZodOptional<z.ZodBoolean>;
    scholarship_updates_enabled: z.ZodOptional<z.ZodBoolean>;
    reminder_days: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    in_app_enabled?: boolean | undefined;
    email_enabled?: boolean | undefined;
    deadline_reminders_enabled?: boolean | undefined;
    opening_reminders_enabled?: boolean | undefined;
    scholarship_updates_enabled?: boolean | undefined;
    reminder_days?: number[] | undefined;
}, {
    in_app_enabled?: boolean | undefined;
    email_enabled?: boolean | undefined;
    deadline_reminders_enabled?: boolean | undefined;
    opening_reminders_enabled?: boolean | undefined;
    scholarship_updates_enabled?: boolean | undefined;
    reminder_days?: number[] | undefined;
}>;
