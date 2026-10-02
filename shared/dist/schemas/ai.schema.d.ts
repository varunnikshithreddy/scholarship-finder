import { z } from 'zod';
export declare const checkEligibilityRequestSchema: z.ZodObject<{
    scholarship_id: z.ZodString;
    profile_override: z.ZodOptional<z.ZodObject<{
        education_level: z.ZodOptional<z.ZodString>;
        discipline: z.ZodOptional<z.ZodString>;
        academic_score: z.ZodOptional<z.ZodNumber>;
        annual_family_income: z.ZodOptional<z.ZodNumber>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        nationality: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        education_level?: string | undefined;
        discipline?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        nationality?: string | undefined;
        academic_score?: number | undefined;
        annual_family_income?: number | undefined;
    }, {
        education_level?: string | undefined;
        discipline?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        nationality?: string | undefined;
        academic_score?: number | undefined;
        annual_family_income?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    scholarship_id: string;
    profile_override?: {
        education_level?: string | undefined;
        discipline?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        nationality?: string | undefined;
        academic_score?: number | undefined;
        annual_family_income?: number | undefined;
    } | undefined;
}, {
    scholarship_id: string;
    profile_override?: {
        education_level?: string | undefined;
        discipline?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        nationality?: string | undefined;
        academic_score?: number | undefined;
        annual_family_income?: number | undefined;
    } | undefined;
}>;
export declare const aiEligibilityAssessmentSchema: z.ZodObject<{
    status: z.ZodEnum<["likely_eligible", "potentially_eligible", "likely_ineligible", "insufficient_information"]>;
    matched_criteria: z.ZodDefault<z.ZodArray<z.ZodObject<{
        criterion_id: z.ZodString;
        criterion: z.ZodString;
        student_value: z.ZodAny;
        required_value: z.ZodAny;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }, {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }>, "many">>;
    unmatched_criteria: z.ZodDefault<z.ZodArray<z.ZodObject<{
        criterion_id: z.ZodString;
        criterion: z.ZodString;
        student_value: z.ZodAny;
        required_value: z.ZodAny;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }, {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }>, "many">>;
    missing_information: z.ZodDefault<z.ZodArray<z.ZodObject<{
        criterion_id: z.ZodOptional<z.ZodString>;
        field: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        field: string;
        reason: string;
        criterion_id?: string | undefined;
    }, {
        field: string;
        reason: string;
        criterion_id?: string | undefined;
    }>, "many">>;
    explanation: z.ZodString;
    confidence_completeness: z.ZodDefault<z.ZodNumber>;
    next_steps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    disclaimer: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "likely_eligible" | "potentially_eligible" | "likely_ineligible" | "insufficient_information";
    explanation: string;
    matched_criteria: {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }[];
    unmatched_criteria: {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }[];
    missing_information: {
        field: string;
        reason: string;
        criterion_id?: string | undefined;
    }[];
    confidence_completeness: number;
    next_steps: string[];
    disclaimer: string;
}, {
    status: "likely_eligible" | "potentially_eligible" | "likely_ineligible" | "insufficient_information";
    explanation: string;
    matched_criteria?: {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }[] | undefined;
    unmatched_criteria?: {
        criterion_id: string;
        criterion: string;
        explanation: string;
        student_value?: any;
        required_value?: any;
    }[] | undefined;
    missing_information?: {
        field: string;
        reason: string;
        criterion_id?: string | undefined;
    }[] | undefined;
    confidence_completeness?: number | undefined;
    next_steps?: string[] | undefined;
    disclaimer?: string | undefined;
}>;
export declare const aiChatRequestSchema: z.ZodObject<{
    message: z.ZodString;
    scholarship_id: z.ZodOptional<z.ZodString>;
    conversation_history: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        sender: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sender: "user" | "assistant";
        content: string;
    }, {
        sender: "user" | "assistant";
        content: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    conversation_history: {
        sender: "user" | "assistant";
        content: string;
    }[];
    scholarship_id?: string | undefined;
}, {
    message: string;
    scholarship_id?: string | undefined;
    conversation_history?: {
        sender: "user" | "assistant";
        content: string;
    }[] | undefined;
}>;
export declare const aiChatResponseSchema: z.ZodObject<{
    answer: z.ZodString;
    source_references: z.ZodDefault<z.ZodArray<z.ZodObject<{
        scholarship_id: z.ZodString;
        title: z.ZodString;
        source_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        scholarship_id: string;
        source_url: string;
    }, {
        title: string;
        scholarship_id: string;
        source_url: string;
    }>, "many">>;
    related_scholarship_ids: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    needs_clarification: z.ZodDefault<z.ZodBoolean>;
    clarification_question: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    information_limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    answer: string;
    source_references: {
        title: string;
        scholarship_id: string;
        source_url: string;
    }[];
    related_scholarship_ids: string[];
    needs_clarification: boolean;
    information_limitations: string[];
    clarification_question?: string | null | undefined;
}, {
    answer: string;
    source_references?: {
        title: string;
        scholarship_id: string;
        source_url: string;
    }[] | undefined;
    related_scholarship_ids?: string[] | undefined;
    needs_clarification?: boolean | undefined;
    clarification_question?: string | null | undefined;
    information_limitations?: string[] | undefined;
}>;
