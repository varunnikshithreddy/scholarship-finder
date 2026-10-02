"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express10 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));

// src/routes/index.ts
var import_express9 = require("express");

// src/routes/scholarships.routes.ts
var import_express = require("express");

// src/config/supabase.ts
var import_supabase_js = require("@supabase/supabase-js");

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), "server", ".env") });
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), "..", ".env") });
var env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5000/api/v1",
  SUPABASE_URL: process.env.SUPABASE_URL || "https://fzhinkkazznnglrxxods.supabase.co",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  AI_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || "60000", 10),
  AI_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || "15", 10),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  APP_TIMEZONE: process.env.APP_TIMEZONE || "Asia/Kolkata"
};

// src/config/supabase.ts
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("[Supabase Config] Warning: SUPABASE_URL or SUPABASE_ANON_KEY is not configured.");
}
var supabasePublic = (0, import_supabase_js.createClient)(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY || "dummy_anon_key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
var supabaseAdmin = (0, import_supabase_js.createClient)(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || "dummy_key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// src/services/scholarships.service.ts
async function getScholarships(params) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const offset = (page - 1) * pageSize;
  let query = supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website, country),
      category:scholarship_categories(id, name, slug, icon_name)
    `, { count: "exact" });
  if (params.status) {
    query = query.eq("status", params.status);
  } else {
    query = query.eq("status", "published");
  }
  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,short_description.ilike.%${term}%`);
  }
  if (params.category) {
    if (params.category.includes("-") && params.category.length === 36) {
      query = query.eq("category_id", params.category);
    } else {
      const { data: cat } = await supabaseAdmin.from("scholarship_categories").select("id").eq("slug", params.category).single();
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }
  }
  if (params.education_level) {
    query = query.contains("education_levels", [params.education_level]);
  }
  if (params.discipline) {
    query = query.contains("disciplines", [params.discipline]);
  }
  if (params.min_funding !== void 0) {
    query = query.gte("funding_amount", params.min_funding);
  }
  if (params.max_funding !== void 0) {
    query = query.lte("funding_amount", params.max_funding);
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (params.application_status === "open") {
    query = query.gte("application_deadline", today);
  } else if (params.application_status === "closing_soon") {
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    query = query.gte("application_deadline", today).lte("application_deadline", sevenDaysLater);
  } else if (params.application_status === "closed") {
    query = query.lt("application_deadline", today);
  }
  switch (params.sort_by) {
    case "deadline":
      query = query.order("application_deadline", { ascending: true, nullsFirst: false });
      break;
    case "funding_high":
      query = query.order("funding_amount", { ascending: false, nullsFirst: false });
      break;
    case "funding_low":
      query = query.order("funding_amount", { ascending: true, nullsFirst: false });
      break;
    case "latest":
    default:
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
  }
  query = query.range(offset, offset + pageSize - 1);
  const { data, count, error } = await query;
  if (error) {
    throw error;
  }
  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);
  const meta = {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
  return { scholarships: data || [], meta };
}
async function getLatestScholarships(limit = 6) {
  const { data, error } = await supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website),
      category:scholarship_categories(id, name, slug, icon_name)
    `).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}
async function getFeaturedScholarships(limit = 6) {
  const { data, error } = await supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website),
      category:scholarship_categories(id, name, slug, icon_name)
    `).eq("status", "published").eq("is_featured", true).order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}
async function getScholarshipById(idOrSlug) {
  const isUuid = idOrSlug.includes("-") && idOrSlug.length === 36;
  const field = isUuid ? "id" : "slug";
  const { data, error } = await supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(*),
      category:scholarship_categories(*),
      criteria:scholarship_eligibility_criteria(*),
      sources:scholarship_sources(*)
    `).eq(field, idOrSlug).single();
  if (error || !data) return null;
  return data;
}
async function getRelatedScholarships(scholarshipId, limit = 4) {
  const { data: target } = await supabaseAdmin.from("scholarships").select("id, category_id, education_levels").eq("id", scholarshipId).single();
  if (!target) return [];
  let query = supabaseAdmin.from("scholarships").select(`
      id, title, slug, short_description, funding_amount, funding_currency,
      application_deadline, is_featured,
      provider:scholarship_providers(name),
      category:scholarship_categories(name)
    `).eq("status", "published").neq("id", scholarshipId);
  if (target.category_id) {
    query = query.eq("category_id", target.category_id);
  }
  const { data } = await query.limit(limit);
  return data || [];
}
async function getCategories() {
  const { data, error } = await supabaseAdmin.from("scholarship_categories").select("*").eq("is_active", true).order("name", { ascending: true });
  if (error) throw error;
  return data;
}
async function getProviders() {
  const { data, error } = await supabaseAdmin.from("scholarship_providers").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

// src/controllers/scholarships.controller.ts
async function listScholarships(req, res, next) {
  try {
    const { scholarships, meta } = await getScholarships(req.query);
    const response = {
      success: true,
      data: scholarships,
      meta
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
}
async function getLatest(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const scholarships = await getLatestScholarships(limit);
    res.json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    next(error);
  }
}
async function getFeatured(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const scholarships = await getFeaturedScholarships(limit);
    res.json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    next(error);
  }
}
async function getDetails(req, res, next) {
  try {
    const scholarship = await getScholarshipById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Scholarship not found or unavailable"
        }
      });
    }
    res.json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    next(error);
  }
}
async function getRelated(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 4;
    const related = await getRelatedScholarships(req.params.id, limit);
    res.json({
      success: true,
      data: related
    });
  } catch (error) {
    next(error);
  }
}
async function listCategories(_req, res, next) {
  try {
    const categories = await getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}
async function listProviders(_req, res, next) {
  try {
    const providers = await getProviders();
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
}

// src/middleware/validate.middleware.ts
var import_zod = require("zod");
function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request payload",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code
            }))
          }
        });
      }
      next(error);
    }
  };
}
function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code
            }))
          }
        });
      }
      next(error);
    }
  };
}

// ../shared/src/schemas/scholarship.schema.ts
var import_zod2 = require("zod");
var documentRequirementSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(1, "Document name is required").max(200),
  description: import_zod2.z.string().max(500),
  is_mandatory: import_zod2.z.boolean().default(true),
  accepted_format: import_zod2.z.string().optional(),
  source_reference: import_zod2.z.string().optional()
});
var scholarshipFilterSchema = import_zod2.z.object({
  search: import_zod2.z.string().optional(),
  category: import_zod2.z.string().optional(),
  education_level: import_zod2.z.string().optional(),
  discipline: import_zod2.z.string().optional(),
  country: import_zod2.z.string().optional(),
  state: import_zod2.z.string().optional(),
  min_funding: import_zod2.z.coerce.number().min(0).optional(),
  max_funding: import_zod2.z.coerce.number().min(0).optional(),
  status: import_zod2.z.enum(["draft", "pending_review", "published", "archived"]).optional(),
  application_status: import_zod2.z.enum(["open", "closing_soon", "upcoming", "closed"]).optional(),
  sort_by: import_zod2.z.enum(["latest", "deadline", "funding_high", "funding_low", "relevance"]).default("latest"),
  page: import_zod2.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod2.z.coerce.number().int().min(1).max(50).default(12)
});
var baseScholarshipSchema = import_zod2.z.object({
  title: import_zod2.z.string().min(5, "Title must be at least 5 characters").max(255),
  slug: import_zod2.z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lower-case alphanumeric with dashes"),
  short_description: import_zod2.z.string().max(500).optional(),
  description: import_zod2.z.string().min(20, "Description must be at least 20 characters"),
  provider_id: import_zod2.z.string().uuid("Invalid provider ID"),
  category_id: import_zod2.z.string().uuid("Invalid category ID").optional(),
  status: import_zod2.z.enum(["draft", "pending_review", "published", "archived"]).default("draft"),
  verification_status: import_zod2.z.enum(["unverified", "pending", "verified", "rejected", "needs_review"]).default("unverified"),
  education_levels: import_zod2.z.array(import_zod2.z.string()).default([]),
  disciplines: import_zod2.z.array(import_zod2.z.string()).default([]),
  eligible_countries: import_zod2.z.array(import_zod2.z.string()).default(["India"]),
  eligible_states: import_zod2.z.array(import_zod2.z.string()).default([]),
  eligible_nationalities: import_zod2.z.array(import_zod2.z.string()).default(["Indian"]),
  funding_amount: import_zod2.z.number().min(0).optional().nullable(),
  funding_currency: import_zod2.z.string().length(3).default("INR"),
  funding_frequency: import_zod2.z.string().max(100).optional().nullable(),
  funding_coverage: import_zod2.z.string().max(255).optional().nullable(),
  application_start_date: import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional().nullable(),
  application_deadline: import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional().nullable(),
  deadline_timezone: import_zod2.z.string().default("Asia/Kolkata"),
  official_application_url: import_zod2.z.string().url("Must be a valid URL").optional().nullable().or(import_zod2.z.literal("")),
  official_source_url: import_zod2.z.string().url("Must be a valid official source URL"),
  selection_process: import_zod2.z.string().optional().nullable(),
  renewal_conditions: import_zod2.z.string().optional().nullable(),
  application_instructions: import_zod2.z.string().optional().nullable(),
  required_documents: import_zod2.z.array(documentRequirementSchema).default([]),
  is_featured: import_zod2.z.boolean().default(false)
});
var createScholarshipSchema = baseScholarshipSchema.refine((data) => {
  if (data.application_start_date && data.application_deadline) {
    return new Date(data.application_start_date) <= new Date(data.application_deadline);
  }
  return true;
}, {
  message: "Application start date must be before or equal to deadline",
  path: ["application_start_date"]
});
var updateScholarshipSchema = baseScholarshipSchema.partial();
var eligibilityCriterionSchema = import_zod2.z.object({
  criterion_type: import_zod2.z.string().min(1),
  operator: import_zod2.z.enum([
    "equals",
    "not_equals",
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "in",
    "contains",
    "between"
  ]),
  expected_value: import_zod2.z.any(),
  description: import_zod2.z.string().max(500).optional(),
  source_text: import_zod2.z.string().max(1e3).optional(),
  is_mandatory: import_zod2.z.boolean().default(true),
  display_order: import_zod2.z.number().int().default(0)
});
var saveScholarshipSchema = import_zod2.z.object({
  scholarship_id: import_zod2.z.string().uuid(),
  application_status: import_zod2.z.enum([
    "interested",
    "planning_to_apply",
    "in_progress",
    "submitted",
    "awarded",
    "not_selected",
    "no_longer_interested"
  ]).default("interested"),
  personal_note: import_zod2.z.string().max(1e3).optional()
});
var updateSavedScholarshipSchema = import_zod2.z.object({
  application_status: import_zod2.z.enum([
    "interested",
    "planning_to_apply",
    "in_progress",
    "submitted",
    "awarded",
    "not_selected",
    "no_longer_interested"
  ]).optional(),
  personal_note: import_zod2.z.string().max(1e3).optional()
});
var reportScholarshipSchema = import_zod2.z.object({
  scholarship_id: import_zod2.z.string().uuid(),
  report_type: import_zod2.z.string().min(2).max(100),
  description: import_zod2.z.string().min(10, "Please provide more details").max(2e3)
});

// ../shared/src/schemas/profile.schema.ts
var import_zod3 = require("zod");
var userRegistrationSchema = import_zod3.z.object({
  full_name: import_zod3.z.string().min(2, "Name must be at least 2 characters").max(100),
  email: import_zod3.z.string().email("Please enter a valid email address"),
  password: import_zod3.z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  terms_agreed: import_zod3.z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy"
  })
});
var userLoginSchema = import_zod3.z.object({
  email: import_zod3.z.string().email("Invalid email address"),
  password: import_zod3.z.string().min(1, "Password is required")
});
var updateProfileSchema = import_zod3.z.object({
  full_name: import_zod3.z.string().min(2).max(100).optional(),
  country: import_zod3.z.string().max(100).optional().nullable(),
  state: import_zod3.z.string().max(100).optional().nullable(),
  nationality: import_zod3.z.string().max(100).optional().nullable(),
  date_of_birth: import_zod3.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional().nullable(),
  education_level: import_zod3.z.string().max(100).optional().nullable(),
  course: import_zod3.z.string().max(150).optional().nullable(),
  discipline: import_zod3.z.string().max(150).optional().nullable(),
  institution: import_zod3.z.string().max(255).optional().nullable(),
  institution_type: import_zod3.z.string().max(100).optional().nullable(),
  academic_year: import_zod3.z.string().max(50).optional().nullable(),
  academic_score: import_zod3.z.number().min(0).max(100).optional().nullable(),
  grading_scale: import_zod3.z.enum(["percentage", "cgpa_10", "cgpa_4"]).default("percentage").optional(),
  expected_graduation_year: import_zod3.z.number().int().min(1900).max(2200).optional().nullable(),
  annual_family_income: import_zod3.z.number().min(0).optional().nullable(),
  income_currency: import_zod3.z.string().length(3).default("INR").optional()
});
var updateNotificationPreferencesSchema = import_zod3.z.object({
  in_app_enabled: import_zod3.z.boolean().optional(),
  email_enabled: import_zod3.z.boolean().optional(),
  deadline_reminders_enabled: import_zod3.z.boolean().optional(),
  opening_reminders_enabled: import_zod3.z.boolean().optional(),
  scholarship_updates_enabled: import_zod3.z.boolean().optional(),
  reminder_days: import_zod3.z.array(import_zod3.z.number().int().positive()).optional()
});

// ../shared/src/schemas/ai.schema.ts
var import_zod4 = require("zod");
var checkEligibilityRequestSchema = import_zod4.z.object({
  scholarship_id: import_zod4.z.string().uuid("Invalid scholarship ID"),
  profile_override: import_zod4.z.object({
    education_level: import_zod4.z.string().optional(),
    discipline: import_zod4.z.string().optional(),
    academic_score: import_zod4.z.number().min(0).max(100).optional(),
    annual_family_income: import_zod4.z.number().min(0).optional(),
    state: import_zod4.z.string().optional(),
    country: import_zod4.z.string().optional(),
    nationality: import_zod4.z.string().optional()
  }).optional()
});
var aiEligibilityAssessmentSchema = import_zod4.z.object({
  status: import_zod4.z.enum([
    "likely_eligible",
    "potentially_eligible",
    "likely_ineligible",
    "insufficient_information"
  ]),
  matched_criteria: import_zod4.z.array(import_zod4.z.object({
    criterion_id: import_zod4.z.string(),
    criterion: import_zod4.z.string(),
    student_value: import_zod4.z.any(),
    required_value: import_zod4.z.any(),
    explanation: import_zod4.z.string()
  })).default([]),
  unmatched_criteria: import_zod4.z.array(import_zod4.z.object({
    criterion_id: import_zod4.z.string(),
    criterion: import_zod4.z.string(),
    student_value: import_zod4.z.any(),
    required_value: import_zod4.z.any(),
    explanation: import_zod4.z.string()
  })).default([]),
  missing_information: import_zod4.z.array(import_zod4.z.object({
    criterion_id: import_zod4.z.string().optional(),
    field: import_zod4.z.string(),
    reason: import_zod4.z.string()
  })).default([]),
  explanation: import_zod4.z.string(),
  confidence_completeness: import_zod4.z.number().min(0).max(100).default(50),
  next_steps: import_zod4.z.array(import_zod4.z.string()).default([]),
  disclaimer: import_zod4.z.string().default("This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider's official website before applying.")
});
var aiChatRequestSchema = import_zod4.z.object({
  message: import_zod4.z.string().min(1, "Message cannot be empty").max(1e3),
  scholarship_id: import_zod4.z.string().uuid().optional(),
  conversation_history: import_zod4.z.array(import_zod4.z.object({
    sender: import_zod4.z.enum(["user", "assistant"]),
    content: import_zod4.z.string().max(2e3)
  })).max(10).optional().default([])
});
var aiChatResponseSchema = import_zod4.z.object({
  answer: import_zod4.z.string(),
  source_references: import_zod4.z.array(import_zod4.z.object({
    scholarship_id: import_zod4.z.string(),
    title: import_zod4.z.string(),
    source_url: import_zod4.z.string()
  })).default([]),
  related_scholarship_ids: import_zod4.z.array(import_zod4.z.string()).default([]),
  needs_clarification: import_zod4.z.boolean().default(false),
  clarification_question: import_zod4.z.string().nullable().optional(),
  information_limitations: import_zod4.z.array(import_zod4.z.string()).default([])
});

// src/routes/scholarships.routes.ts
var router = (0, import_express.Router)();
router.get("/", validateQuery(scholarshipFilterSchema), listScholarships);
router.get("/latest", getLatest);
router.get("/featured", getFeatured);
router.get("/:id", getDetails);
router.get("/:id/related", getRelated);
var scholarships_routes_default = router;

// src/routes/profile.routes.ts
var import_express2 = require("express");

// src/services/profile.service.ts
async function getProfile(userId) {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return data;
}
async function updateProfile(userId, input) {
  const isComplete = Boolean(
    input.education_level && input.discipline && input.academic_score !== void 0 && input.state
  );
  const payload = {
    ...input,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (isComplete) {
    payload.profile_completed = true;
  }
  const { data, error } = await supabaseAdmin.from("profiles").update(payload).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}
async function deleteProfile(userId) {
  const { error } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
  if (error) throw error;
  await supabaseAdmin.auth.admin.deleteUser(userId);
  return true;
}

// src/controllers/profile.controller.ts
async function getMyProfile(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Student profile not found"
        }
      });
    }
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}
async function updateMyProfile(req, res, next) {
  try {
    const updated = await updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      data: updated,
      message: "Profile updated successfully"
    });
  } catch (error) {
    next(error);
  }
}
async function deleteMyAccount(req, res, next) {
  try {
    await deleteProfile(req.user.id);
    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// src/middleware/auth.middleware.ts
async function extractUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const { data: authData, error: authError } = await supabasePublic.auth.getUser(token);
    if (authError || !authData.user) {
      return null;
    }
    const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", authData.user.id).single();
    return {
      id: authData.user.id,
      email: authData.user.email,
      role: profile?.role || "student"
    };
  } catch (error) {
    return null;
  }
}
async function requireAuth(req, res, next) {
  const user = await extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required to access this resource"
      }
    });
  }
  req.user = user;
  next();
}
async function requireAdmin(req, res, next) {
  const user = await extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required"
      }
    });
  }
  if (user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Administrator privileges are required for this action"
      }
    });
  }
  req.user = user;
  next();
}
async function optionalAuth(req, _res, next) {
  const user = await extractUserFromRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}

// src/routes/profile.routes.ts
var router2 = (0, import_express2.Router)();
router2.use(requireAuth);
router2.get("/", getMyProfile);
router2.patch("/", validateBody(updateProfileSchema), updateMyProfile);
router2.delete("/", deleteMyAccount);
var profile_routes_default = router2;

// src/routes/eligibility.routes.ts
var import_express3 = require("express");

// src/services/ai/gemini.service.ts
var import_genai = require("@google/genai");
var genAIClient = null;
if (env.GEMINI_API_KEY) {
  try {
    genAIClient = new import_genai.GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (err) {
    console.warn("[Gemini Service] Could not initialize GoogleGenAI client:", err);
  }
} else {
  console.info("[Gemini Service] GEMINI_API_KEY not configured. Deterministic rules & fallback responses will be used.");
}
function isGeminiConfigured() {
  return !!genAIClient && !!env.GEMINI_API_KEY;
}
var AI_SYSTEM_PROMPT = `
You are Scholarship Finder AI, a factual, transparent, student-focused scholarship information assistant.
Your purpose is to help students discover scholarship opportunities, understand documented eligibility requirements, interpret application instructions, and compare scholarship information supplied by the application.

CORE DIRECTIVES:
1. Answer using ONLY the verified scholarship records and contextual data provided by the backend.
2. Never fabricate scholarship names, deadlines, scholarship amounts, eligibility criteria, application instructions, official URLs, or provider information.
3. Clearly identify missing, uncertain, outdated, or unverified information.
4. Distinguish verified source information from your own explanations.
5. Never guarantee that a student is eligible, will be selected, or will receive funding.
6. Never claim that an AI assessment is an official eligibility decision.
7. Never make up facts to provide a more complete-looking response.
8. If the database lacks sufficient information, explicitly state the limitation.
9. Direct students to the relevant official source for final confirmation.
10. Explain complex eligibility conditions in simple, student-friendly language.
11. Do not ask for passwords, authentication tokens, payment details, or unnecessary personal data.
12. Always output valid JSON conforming exactly to the requested schema.

MANDATORY DISCLAIMER:
"This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider's official website before applying."
`;
async function callGemini(prompt, systemInstruction = AI_SYSTEM_PROMPT) {
  if (!genAIClient) {
    return null;
  }
  try {
    const model = env.GEMINI_MODEL || "gemini-2.0-flash";
    const response = await genAIClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    return response.text || null;
  } catch (error) {
    try {
      const fallback = await genAIClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      return fallback.text || null;
    } catch {
      console.warn("[Gemini Fallback Advisory]: Using deterministic criteria rules.");
      return null;
    }
  }
}

// src/services/ai/eligibilityEngine.service.ts
async function evaluateEligibility({
  scholarship,
  criteria,
  profile,
  userId
}) {
  const matched = [];
  const unmatched = [];
  const missing = [];
  for (const crit of criteria) {
    const type = crit.criterion_type;
    const operator = crit.operator;
    const expected = crit.expected_value;
    switch (type) {
      case "academic_score": {
        const studentScore = profile.academic_score;
        if (studentScore === null || studentScore === void 0) {
          missing.push({
            criterion_id: crit.id,
            field: "academic_score",
            reason: `Academic performance requirement (${crit.description || "score threshold"}) requires your GPA or percentage.`
          });
          break;
        }
        const requiredScore = typeof expected === "number" ? expected : expected?.value;
        let isMatch = false;
        if (operator === "greater_than_or_equal") isMatch = studentScore >= requiredScore;
        else if (operator === "greater_than") isMatch = studentScore > requiredScore;
        else if (operator === "equals") isMatch = studentScore === requiredScore;
        else isMatch = studentScore >= requiredScore;
        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Minimum Academic Score",
            student_value: `${studentScore}%`,
            required_value: `${requiredScore}%`,
            explanation: `Your reported academic score of ${studentScore}% satisfies the minimum requirement of ${requiredScore}%.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Minimum Academic Score",
            student_value: `${studentScore}%`,
            required_value: `${requiredScore}%`,
            explanation: `Your score of ${studentScore}% does not meet the specified threshold of ${requiredScore}%.`
          });
        }
        break;
      }
      case "annual_family_income": {
        const studentIncome = profile.annual_family_income;
        if (studentIncome === null || studentIncome === void 0) {
          missing.push({
            criterion_id: crit.id,
            field: "annual_family_income",
            reason: `Income ceiling requirement (${crit.description || "household income threshold"}) requires your family income.`
          });
          break;
        }
        const maxIncome = typeof expected === "number" ? expected : expected?.value;
        let isMatch = false;
        if (operator === "less_than_or_equal") isMatch = studentIncome <= maxIncome;
        else if (operator === "less_than") isMatch = studentIncome < maxIncome;
        else if (operator === "equals") isMatch = studentIncome === maxIncome;
        else isMatch = studentIncome <= maxIncome;
        const formattedStudent = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(studentIncome);
        const formattedRequired = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(maxIncome);
        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Maximum Family Income Limit",
            student_value: formattedStudent,
            required_value: formattedRequired,
            explanation: `Your household income (${formattedStudent}) is within the allowable limit of ${formattedRequired}.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Maximum Family Income Limit",
            student_value: formattedStudent,
            required_value: formattedRequired,
            explanation: `Your reported income (${formattedStudent}) exceeds the maximum eligible limit of ${formattedRequired}.`
          });
        }
        break;
      }
      case "education_level": {
        const studentLevel = profile.education_level;
        if (!studentLevel) {
          missing.push({
            criterion_id: crit.id,
            field: "education_level",
            reason: "Current education level is needed to check qualification eligibility."
          });
          break;
        }
        const allowedLevels = Array.isArray(expected) ? expected : expected?.values || [];
        const isMatch = allowedLevels.some((lvl) => lvl.toLowerCase() === studentLevel.toLowerCase());
        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Education Level",
            student_value: studentLevel,
            required_value: allowedLevels.join(", "),
            explanation: `Your current education level (${studentLevel}) matches the eligible courses.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Education Level",
            student_value: studentLevel,
            required_value: allowedLevels.join(", "),
            explanation: `Education level ${studentLevel} is not listed in the accepted levels (${allowedLevels.join(", ")}).`
          });
        }
        break;
      }
      case "discipline": {
        const studentDiscipline = profile.discipline;
        if (!studentDiscipline) {
          missing.push({
            criterion_id: crit.id,
            field: "discipline",
            reason: "Academic stream or discipline is required."
          });
          break;
        }
        const allowedDisciplines = Array.isArray(expected) ? expected : expected?.values || [];
        const isMatch = allowedDisciplines.some((d) => d.toLowerCase() === studentDiscipline.toLowerCase());
        if (isMatch) {
          matched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Academic Discipline",
            student_value: studentDiscipline,
            required_value: allowedDisciplines.join(", "),
            explanation: `Your field of study (${studentDiscipline}) is eligible under this program.`
          });
        } else {
          unmatched.push({
            criterion_id: crit.id,
            criterion: crit.description || "Academic Discipline",
            student_value: studentDiscipline,
            required_value: allowedDisciplines.join(", "),
            explanation: `This opportunity is targeted towards: ${allowedDisciplines.join(", ")}.`
          });
        }
        break;
      }
      default: {
        matched.push({
          criterion_id: crit.id,
          criterion: crit.description || crit.criterion_type,
          student_value: "Reported",
          required_value: "Documented",
          explanation: crit.source_text || "Documented criterion."
        });
        break;
      }
    }
  }
  const totalCriteria = criteria.length || 1;
  const evaluatedCount = matched.length + unmatched.length;
  const confidenceCompleteness = Math.round(evaluatedCount / totalCriteria * 100);
  let status = "potentially_eligible";
  const hasMandatoryUnmatched = unmatched.some((u) => {
    const criterion = criteria.find((c) => c.id === u.criterion_id);
    return criterion?.is_mandatory ?? true;
  });
  if (hasMandatoryUnmatched) {
    status = "likely_ineligible";
  } else if (missing.length > 0 && matched.length === 0) {
    status = "insufficient_information";
  } else if (missing.length > 0 && matched.length > 0) {
    status = "potentially_eligible";
  } else if (unmatched.length === 0 && matched.length > 0) {
    status = "likely_eligible";
  }
  let finalExplanation = `Based on the provided information, ${matched.length} criteria matched, ${unmatched.length} did not match, and ${missing.length} criteria require additional verification.`;
  let nextSteps = [
    "Review the official scholarship notification to confirm supporting documents.",
    "Keep your income certificate and academic transcripts updated.",
    "Apply before the official deadline on the designated application portal."
  ];
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
      console.warn("[Eligibility Engine] Gemini enhancement fallback:", err);
    }
  }
  const result = {
    scholarship_id: scholarship.id,
    user_id: userId,
    status,
    matched_criteria: matched,
    unmatched_criteria: unmatched,
    missing_information: missing,
    explanation: finalExplanation,
    confidence_completeness: confidenceCompleteness,
    next_steps: nextSteps,
    disclaimer: "This is an AI-assisted assessment based on the information currently available. It is not an official eligibility decision. Please verify all requirements and deadlines on the scholarship provider's official website before applying.",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (userId) {
    try {
      const { data: inserted } = await supabaseAdmin.from("eligibility_assessments").insert({
        user_id: userId,
        scholarship_id: scholarship.id,
        status,
        matched_criteria: matched,
        unmatched_criteria: unmatched,
        missing_information: missing,
        explanation: finalExplanation,
        confidence_completeness: confidenceCompleteness,
        model_name: isGeminiConfigured() ? "gemini-2.5-flash" : "rule_engine_v1",
        prompt_version: "v1.0"
      }).select("id").single();
      if (inserted) {
        result.id = inserted.id;
      }
    } catch (dbErr) {
      console.warn("[Eligibility Engine] Could not save assessment to database:", dbErr);
    }
  }
  return result;
}

// src/controllers/eligibility.controller.ts
async function checkEligibility(req, res, next) {
  try {
    const { scholarship_id, profile_override } = req.body;
    const scholarship = await getScholarshipById(scholarship_id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Scholarship not found"
        }
      });
    }
    let userProfile = {};
    if (req.user) {
      const stored = await getProfile(req.user.id);
      if (stored) userProfile = stored;
    }
    const mergedProfile = {
      ...userProfile,
      ...profile_override || {}
    };
    const criteria = scholarship.criteria || [];
    const assessment = await evaluateEligibility({
      scholarship,
      criteria,
      profile: mergedProfile,
      userId: req.user?.id
    });
    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
}
async function getAssessmentHistory(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from("eligibility_assessments").select(`
        *,
        scholarship:scholarships(id, title, slug, funding_amount, funding_currency, application_deadline)
      `).eq("user_id", req.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    next(error);
  }
}
async function getAssessmentById(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from("eligibility_assessments").select(`
        *,
        scholarship:scholarships(*)
      `).eq("id", req.params.id).eq("user_id", req.user.id).single();
    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Assessment record not found"
        }
      });
    }
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

// src/middleware/rateLimit.middleware.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var standardRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later."
    }
  }
});
var aiRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMIT_EXCEEDED",
      message: "AI request limit reached. Please wait a moment before trying again."
    }
  }
});

// src/routes/eligibility.routes.ts
var router3 = (0, import_express3.Router)();
router3.post("/check", optionalAuth, aiRateLimiter, validateBody(checkEligibilityRequestSchema), checkEligibility);
router3.get("/history", requireAuth, getAssessmentHistory);
router3.get("/:id", requireAuth, getAssessmentById);
var eligibility_routes_default = router3;

// src/routes/recommendations.routes.ts
var import_express4 = require("express");

// src/services/ai/recommendations.service.ts
async function getPersonalizedRecommendations(userProfile) {
  const { data: scholarships, error } = await supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(name, official_website),
      category:scholarship_categories(name),
      criteria:scholarship_eligibility_criteria(*)
    `).eq("status", "published").order("application_deadline", { ascending: true });
  if (error || !scholarships) {
    console.error("[Recommendations Service] Query error:", error);
    return [];
  }
  const recommendations = [];
  for (const s of scholarships) {
    const reasons = [];
    const matchedCriteria = [];
    const missingInfo = [];
    let matchScore = 0;
    if (userProfile.education_level && Array.isArray(s.education_levels) && s.education_levels.length > 0) {
      const match = s.education_levels.some(
        (lvl) => lvl.toLowerCase() === userProfile.education_level?.toLowerCase()
      );
      if (match) {
        matchScore += 30;
        reasons.push(`Matches your current education level (${userProfile.education_level})`);
        matchedCriteria.push("education_level");
      }
    } else if (!userProfile.education_level) {
      missingInfo.push("education_level");
    }
    if (userProfile.discipline && Array.isArray(s.disciplines) && s.disciplines.length > 0) {
      const match = s.disciplines.some(
        (d) => d.toLowerCase() === userProfile.discipline?.toLowerCase()
      );
      if (match) {
        matchScore += 25;
        reasons.push(`Supports students in ${userProfile.discipline}`);
        matchedCriteria.push("discipline");
      }
    } else if (!userProfile.discipline) {
      missingInfo.push("discipline");
    }
    if (Array.isArray(s.criteria)) {
      for (const crit of s.criteria) {
        if (crit.criterion_type === "academic_score" && userProfile.academic_score !== null && userProfile.academic_score !== void 0) {
          const req = crit.expected_value?.value || crit.expected_value;
          if (userProfile.academic_score >= req) {
            matchScore += 20;
            reasons.push(`Academic score (${userProfile.academic_score}%) meets requirement (${req}%)`);
            matchedCriteria.push("academic_score");
          }
        }
        if (crit.criterion_type === "annual_family_income" && userProfile.annual_family_income !== null && userProfile.annual_family_income !== void 0) {
          const maxInc = crit.expected_value?.value || crit.expected_value;
          if (userProfile.annual_family_income <= maxInc) {
            matchScore += 20;
            reasons.push(`Income criteria satisfied (below allowable limit)`);
            matchedCriteria.push("annual_family_income");
          }
        }
      }
    }
    let appStatus = "open";
    const now = /* @__PURE__ */ new Date();
    if (s.application_deadline) {
      const deadline = new Date(s.application_deadline);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      if (diffDays < 0) {
        appStatus = "closed";
        continue;
      } else if (diffDays <= 7) {
        appStatus = "closing_soon";
        matchScore += 10;
      } else {
        appStatus = "open";
      }
    }
    if (matchScore >= 20 || !userProfile.education_level && !userProfile.discipline) {
      recommendations.push({
        score: matchScore,
        item: {
          scholarship_id: s.id,
          scholarship_title: s.title,
          provider_name: s.provider?.name || "Verified Organization",
          funding_amount: s.funding_amount,
          application_deadline: s.application_deadline,
          reasons: reasons.length > 0 ? reasons : ["General student financial assistance opportunity"],
          matched_criteria: matchedCriteria,
          missing_information: missingInfo,
          application_status: appStatus,
          explanation: `This scholarship is recommended based on your verified academic profile parameters.`,
          official_source_url: s.official_source_url
        }
      });
    }
  }
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.map((r) => r.item);
}

// src/controllers/recommendations.controller.ts
async function getRecommendations(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Please complete your student profile to view tailored recommendations."
        }
      });
    }
    const recommendations = await getPersonalizedRecommendations(profile);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/recommendations.routes.ts
var router4 = (0, import_express4.Router)();
router4.use(requireAuth);
router4.get("/", getRecommendations);
router4.post("/refresh", getRecommendations);
var recommendations_routes_default = router4;

// src/routes/savedScholarships.routes.ts
var import_express5 = require("express");

// src/services/savedScholarships.service.ts
async function getSavedScholarships(userId) {
  const { data, error } = await supabaseAdmin.from("saved_scholarships").select(`
      *,
      scholarship:scholarships(
        id, title, slug, short_description, funding_amount, funding_currency,
        application_start_date, application_deadline, official_application_url,
        official_source_url, status,
        provider:scholarship_providers(name)
      )
    `).eq("user_id", userId).order("saved_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
async function saveScholarship(userId, scholarshipId, status = "interested", note) {
  const { data, error } = await supabaseAdmin.from("saved_scholarships").upsert({
    user_id: userId,
    scholarship_id: scholarshipId,
    application_status: status,
    personal_note: note || null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, { onConflict: "user_id,scholarship_id" }).select(`
      *,
      scholarship:scholarships(id, title, slug, funding_amount, application_deadline)
    `).single();
  if (error) throw error;
  return data;
}
async function updateSavedScholarship(userId, id, status, note) {
  const payload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
  if (status) payload.application_status = status;
  if (note !== void 0) payload.personal_note = note;
  const { data, error } = await supabaseAdmin.from("saved_scholarships").update(payload).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data;
}
async function removeSavedScholarship(userId, id) {
  const { error } = await supabaseAdmin.from("saved_scholarships").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return true;
}

// src/controllers/savedScholarships.controller.ts
async function listSaved(req, res, next) {
  try {
    const list = await getSavedScholarships(req.user.id);
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
}
async function save(req, res, next) {
  try {
    const { scholarship_id, application_status, personal_note } = req.body;
    const saved = await saveScholarship(
      req.user.id,
      scholarship_id,
      application_status,
      personal_note
    );
    res.status(201).json({
      success: true,
      data: saved,
      message: "Scholarship saved to your list"
    });
  } catch (error) {
    next(error);
  }
}
async function updateSaved(req, res, next) {
  try {
    const { application_status, personal_note } = req.body;
    const updated = await updateSavedScholarship(
      req.user.id,
      req.params.id,
      application_status,
      personal_note
    );
    res.json({
      success: true,
      data: updated,
      message: "Application status updated"
    });
  } catch (error) {
    next(error);
  }
}
async function removeSaved(req, res, next) {
  try {
    await removeSavedScholarship(req.user.id, req.params.id);
    res.json({
      success: true,
      message: "Scholarship removed from saved list"
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/savedScholarships.routes.ts
var router5 = (0, import_express5.Router)();
router5.use(requireAuth);
router5.get("/", listSaved);
router5.post("/", validateBody(saveScholarshipSchema), save);
router5.patch("/:id", validateBody(updateSavedScholarshipSchema), updateSaved);
router5.delete("/:id", removeSaved);
var savedScholarships_routes_default = router5;

// src/routes/assistant.routes.ts
var import_express6 = require("express");

// src/services/ai/assistant.service.ts
async function askScholarshipAssistant({ message, scholarshipId, history = [] }) {
  let contextScholarships = [];
  if (scholarshipId) {
    const { data: specific } = await supabaseAdmin.from("scholarships").select(`
        *,
        provider:scholarship_providers(name, official_website),
        category:scholarship_categories(name),
        criteria:scholarship_eligibility_criteria(*)
      `).eq("id", scholarshipId).single();
    if (specific) {
      contextScholarships.push(specific);
    }
  }
  const words = message.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter((w) => w.length > 3);
  let dbQuery = supabaseAdmin.from("scholarships").select(`
      id, title, slug, short_description, funding_amount, funding_currency,
      application_deadline, official_application_url, official_source_url,
      education_levels, disciplines,
      provider:scholarship_providers(name)
    `).eq("status", "published").limit(5);
  if (words.length > 0) {
    dbQuery = dbQuery.ilike("title", `%${words[0]}%`);
  }
  const { data: related } = await dbQuery;
  if (related) {
    for (const r of related) {
      if (!contextScholarships.some((s) => s.id === r.id)) {
        contextScholarships.push(r);
      }
    }
  }
  if (contextScholarships.length === 0) {
    const { data: popular } = await supabaseAdmin.from("scholarships").select(`
        id, title, slug, short_description, funding_amount, funding_currency,
        application_deadline, official_application_url, official_source_url,
        provider:scholarship_providers(name)
      `).eq("status", "published").limit(3);
    if (popular) contextScholarships = popular;
  }
  const recordsSummary = contextScholarships.map((s) => ({
    id: s.id,
    title: s.title,
    provider: s.provider?.name,
    amount: s.funding_amount ? `${s.funding_currency || "INR"} ${s.funding_amount}` : "Not specified",
    deadline: s.application_deadline || "Not specified",
    source_url: s.official_source_url,
    application_url: s.official_application_url,
    education_levels: s.education_levels,
    disciplines: s.disciplines,
    criteria: s.criteria?.map((c) => c.description || c.source_text) || []
  }));
  if (isGeminiConfigured()) {
    const prompt = `
Verified Scholarship Database Context:
${JSON.stringify(recordsSummary, null, 2)}

User Question: "${message}"

Recent Conversation:
${history.map((h) => `${h.sender.toUpperCase()}: ${h.content}`).join("\n")}

Instructions:
Answer the student's question accurately using ONLY the supplied verified database context.
If the information is not in the database records, state that clearly and suggest verifying on the official source portal.
Never make up URLs, dates, or amounts.

Respond with valid JSON matching this schema:
{
  "answer": "A clear, helpful, structured student-friendly explanation",
  "source_references": [
    {
      "scholarship_id": "exact_id_from_context",
      "title": "exact_title",
      "source_url": "exact_source_url_from_context"
    }
  ],
  "related_scholarship_ids": ["exact_id_from_context"],
  "needs_clarification": false,
  "clarification_question": null,
  "information_limitations": []
}
`;
    try {
      const rawText = await callGemini(prompt);
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validated = aiChatResponseSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    } catch (err) {
      console.warn("[Assistant Service] Gemini parse error, using factual fallback:", err);
    }
  }
  const topScholarship = contextScholarships[0];
  const sourceRefs = contextScholarships.slice(0, 3).map((s) => ({
    scholarship_id: s.id,
    title: s.title,
    source_url: s.official_source_url
  }));
  let fallbackAnswer = `Based on our verified scholarship database, we have relevant opportunities including **${topScholarship?.title || "National Scholarship Programs"}**.`;
  if (topScholarship?.funding_amount) {
    fallbackAnswer += ` It offers financial aid of up to **${topScholarship.funding_currency || "INR"} ${topScholarship.funding_amount}** with application deadline on **${topScholarship.application_deadline || "scheduled dates"}**.`;
  }
  fallbackAnswer += `

You can review eligibility requirements and apply directly through the official provider link below.`;
  return {
    answer: fallbackAnswer,
    source_references: sourceRefs,
    related_scholarship_ids: contextScholarships.map((s) => s.id),
    needs_clarification: false,
    clarification_question: null,
    information_limitations: ["Generated using verified database records. For custom conversational guidance, configure GEMINI_API_KEY."]
  };
}

// src/controllers/assistant.controller.ts
async function chat(req, res, next) {
  try {
    const { message, scholarship_id, conversation_history } = req.body;
    const response = await askScholarshipAssistant({
      message,
      scholarshipId: scholarship_id,
      history: conversation_history
    });
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/assistant.routes.ts
var router6 = (0, import_express6.Router)();
router6.post("/chat", aiRateLimiter, validateBody(aiChatRequestSchema), chat);
var assistant_routes_default = router6;

// src/routes/notifications.routes.ts
var import_express7 = require("express");

// src/services/notifications.service.ts
async function getNotifications(userId) {
  const { data, error } = await supabaseAdmin.from("notifications").select(`
      *,
      scholarship:scholarships(id, title, slug)
    `).eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
async function markNotificationRead(userId, id) {
  const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return true;
}
async function markAllNotificationsRead(userId) {
  const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("user_id", userId);
  if (error) throw error;
  return true;
}
async function getNotificationPreferences(userId) {
  let { data, error } = await supabaseAdmin.from("notification_preferences").select("*").eq("user_id", userId).single();
  if (!data) {
    const { data: created } = await supabaseAdmin.from("notification_preferences").insert({ user_id: userId }).select().single();
    data = created;
  }
  return data;
}
async function updateNotificationPreferences(userId, prefs) {
  const { data, error } = await supabaseAdmin.from("notification_preferences").upsert({
    user_id: userId,
    ...prefs,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// src/controllers/notifications.controller.ts
async function listNotifications(req, res, next) {
  try {
    const list = await getNotifications(req.user.id);
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
}
async function markRead(req, res, next) {
  try {
    await markNotificationRead(req.user.id, req.params.id);
    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    next(error);
  }
}
async function markAllRead(req, res, next) {
  try {
    await markAllNotificationsRead(req.user.id);
    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    next(error);
  }
}
async function getPreferences(req, res, next) {
  try {
    const prefs = await getNotificationPreferences(req.user.id);
    res.json({
      success: true,
      data: prefs
    });
  } catch (error) {
    next(error);
  }
}
async function updatePreferences(req, res, next) {
  try {
    const updated = await updateNotificationPreferences(req.user.id, req.body);
    res.json({
      success: true,
      data: updated,
      message: "Notification preferences updated"
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/notifications.routes.ts
var router7 = (0, import_express7.Router)();
router7.use(requireAuth);
router7.get("/", listNotifications);
router7.patch("/read-all", markAllRead);
router7.patch("/:id/read", markRead);
router7.get("/preferences", getPreferences);
router7.patch("/preferences", validateBody(updateNotificationPreferencesSchema), updatePreferences);
var notifications_routes_default = router7;

// src/routes/admin.routes.ts
var import_express8 = require("express");

// src/services/admin.service.ts
async function logAdminAction(adminId, action, entityType, entityId, oldValues, newValues) {
  try {
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_values: oldValues || null,
      new_values: newValues || null
    });
  } catch (err) {
    console.error("[Audit Log] Failed to insert audit log:", err);
  }
}
async function getAdminOverview() {
  const [
    { count: totalCount },
    { count: publishedCount },
    { count: draftCount },
    { count: providersCount },
    { count: reportsCount },
    { count: assessmentsCount }
  ] = await Promise.all([
    supabaseAdmin.from("scholarships").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("scholarships").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabaseAdmin.from("scholarships").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabaseAdmin.from("scholarship_providers").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("scholarship_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabaseAdmin.from("eligibility_assessments").select("*", { count: "exact", head: true })
  ]);
  return {
    total_scholarships: totalCount || 0,
    published_scholarships: publishedCount || 0,
    draft_scholarships: draftCount || 0,
    total_providers: providersCount || 0,
    open_reports: reportsCount || 0,
    total_assessments: assessmentsCount || 0
  };
}
async function getAllScholarshipsAdmin(page = 1, pageSize = 20, search) {
  let query = supabaseAdmin.from("scholarships").select(`
      *,
      provider:scholarship_providers(id, name),
      category:scholarship_categories(id, name)
    `, { count: "exact" });
  if (search && search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }
  const offset = (page - 1) * pageSize;
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);
  if (error) throw error;
  return { scholarships: data || [], total: count || 0 };
}
async function createScholarshipAdmin(data, adminId) {
  const payload = {
    ...data,
    created_by: adminId,
    updated_by: adminId,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const { data: created, error } = await supabaseAdmin.from("scholarships").insert(payload).select().single();
  if (error) throw error;
  await logAdminAction(adminId, "CREATE_SCHOLARSHIP", "scholarships", created.id, null, created);
  return created;
}
async function updateScholarshipAdmin(id, updates, adminId) {
  const { data: existing } = await supabaseAdmin.from("scholarships").select("*").eq("id", id).single();
  const payload = {
    ...updates,
    updated_by: adminId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const { data: updated, error } = await supabaseAdmin.from("scholarships").update(payload).eq("id", id).select().single();
  if (error) throw error;
  await logAdminAction(adminId, "UPDATE_SCHOLARSHIP", "scholarships", id, existing, updated);
  return updated;
}
async function archiveScholarshipAdmin(id, adminId) {
  return updateScholarshipAdmin(
    id,
    { status: "archived", archived_at: (/* @__PURE__ */ new Date()).toISOString() },
    adminId
  );
}
async function publishScholarshipAdmin(id, adminId) {
  return updateScholarshipAdmin(
    id,
    { status: "published", published_at: (/* @__PURE__ */ new Date()).toISOString() },
    adminId
  );
}
async function unpublishScholarshipAdmin(id, adminId) {
  return updateScholarshipAdmin(
    id,
    { status: "draft", published_at: null },
    adminId
  );
}
async function verifyScholarshipAdmin(id, verification_status, notes, adminId) {
  return updateScholarshipAdmin(
    id,
    {
      verification_status,
      source_last_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      source_metadata: { verified_by: adminId, verification_notes: notes }
    },
    adminId
  );
}
async function getReportsAdmin() {
  const { data, error } = await supabaseAdmin.from("scholarship_reports").select(`
      *,
      scholarship:scholarships(id, title, slug),
      reporter:profiles(id, full_name)
    `).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
async function updateReportStatusAdmin(id, status, adminId) {
  const { data, error } = await supabaseAdmin.from("scholarship_reports").update({
    status,
    reviewed_by: adminId,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id).select().single();
  if (error) throw error;
  await logAdminAction(adminId, "UPDATE_REPORT_STATUS", "scholarship_reports", id, null, { status });
  return data;
}
async function getAuditLogsAdmin(limit = 50) {
  const { data, error } = await supabaseAdmin.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

// src/controllers/admin.controller.ts
async function getOverview(_req, res, next) {
  try {
    const metrics = await getAdminOverview();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}
async function listScholarships2(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const search = req.query.search;
    const result = await getAllScholarshipsAdmin(page, pageSize, search);
    res.json({
      success: true,
      data: result.scholarships,
      meta: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
        hasNextPage: page < Math.ceil(result.total / pageSize),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
}
async function createScholarship(req, res, next) {
  try {
    const created = await createScholarshipAdmin(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: created,
      message: "Scholarship created successfully"
    });
  } catch (error) {
    next(error);
  }
}
async function updateScholarship(req, res, next) {
  try {
    const updated = await updateScholarshipAdmin(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      data: updated,
      message: "Scholarship updated successfully"
    });
  } catch (error) {
    next(error);
  }
}
async function archiveScholarship(req, res, next) {
  try {
    const archived = await archiveScholarshipAdmin(req.params.id, req.user.id);
    res.json({
      success: true,
      data: archived,
      message: "Scholarship archived"
    });
  } catch (error) {
    next(error);
  }
}
async function publishScholarship(req, res, next) {
  try {
    const published = await publishScholarshipAdmin(req.params.id, req.user.id);
    res.json({
      success: true,
      data: published,
      message: "Scholarship published to public directory"
    });
  } catch (error) {
    next(error);
  }
}
async function unpublishScholarship(req, res, next) {
  try {
    const unpublished = await unpublishScholarshipAdmin(req.params.id, req.user.id);
    res.json({
      success: true,
      data: unpublished,
      message: "Scholarship unpublished and moved to draft"
    });
  } catch (error) {
    next(error);
  }
}
async function verifyScholarship(req, res, next) {
  try {
    const { verification_status, notes } = req.body;
    const verified = await verifyScholarshipAdmin(
      req.params.id,
      verification_status,
      notes,
      req.user.id
    );
    res.json({
      success: true,
      data: verified,
      message: "Scholarship verification status updated"
    });
  } catch (error) {
    next(error);
  }
}
async function listReports(_req, res, next) {
  try {
    const reports = await getReportsAdmin();
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
}
async function updateReport(req, res, next) {
  try {
    const { status } = req.body;
    const updated = await updateReportStatusAdmin(req.params.id, status, req.user.id);
    res.json({
      success: true,
      data: updated,
      message: "Report status updated"
    });
  } catch (error) {
    next(error);
  }
}
async function listAuditLogs(_req, res, next) {
  try {
    const logs = await getAuditLogsAdmin();
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}

// src/routes/admin.routes.ts
var router8 = (0, import_express8.Router)();
router8.use(requireAdmin);
router8.get("/overview", getOverview);
router8.get("/scholarships", listScholarships2);
router8.post("/scholarships", validateBody(createScholarshipSchema), createScholarship);
router8.patch("/scholarships/:id", validateBody(updateScholarshipSchema), updateScholarship);
router8.delete("/scholarships/:id", archiveScholarship);
router8.post("/scholarships/:id/publish", publishScholarship);
router8.post("/scholarships/:id/unpublish", unpublishScholarship);
router8.post("/scholarships/:id/verify", verifyScholarship);
router8.get("/reports", listReports);
router8.patch("/reports/:id", updateReport);
router8.get("/audit-logs", listAuditLogs);
var admin_routes_default = router8;

// src/routes/index.ts
var apiRouter = (0, import_express9.Router)();
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "Scholarship Finder API",
    version: "1.0.0"
  });
});
apiRouter.get("/categories", listCategories);
apiRouter.get("/providers", listProviders);
apiRouter.use("/scholarships", scholarships_routes_default);
apiRouter.use("/profile", profile_routes_default);
apiRouter.use("/eligibility", eligibility_routes_default);
apiRouter.use("/recommendations", recommendations_routes_default);
apiRouter.use("/saved-scholarships", savedScholarships_routes_default);
apiRouter.use("/ai", assistant_routes_default);
apiRouter.use("/notifications", notifications_routes_default);
apiRouter.use("/admin", admin_routes_default);
var routes_default = apiRouter;

// src/middleware/error.middleware.ts
function errorHandler(err, _req, res, _next) {
  console.error("[Unhandled Error]", err);
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && statusCode === 500 ? "An unexpected error occurred. Please try again later." : err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message,
      details: err.details || void 0
    }
  });
}

// src/app.ts
var app = (0, import_express10.default)();
app.use((0, import_helmet.default)({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
var allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];
app.use((0, import_cors.default)({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(import_express10.default.json({ limit: "5mb" }));
app.use(import_express10.default.urlencoded({ extended: true, limit: "5mb" }));
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Scholarship Finder Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api_v1: "/api/v1"
    }
  });
});
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "Scholarship Finder API"
  });
});
app.use("/api/v1", routes_default);
app.use("/api", routes_default);
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});
app.use(errorHandler);

// src/server.ts
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;
var HOST = "0.0.0.0";
var server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` Scholarship Finder Backend API Server Running`);
  console.log(` Host: ${HOST}`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Base URL: http://${HOST}:${PORT}/api/v1`);
  console.log(` Healthcheck: http://${HOST}:${PORT}/health`);
  console.log(`=======================================================`);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
