import { supabaseAdmin } from '../config/supabase';
import {
  Scholarship,
  ScholarshipFilterParams,
  PaginationMeta
} from '@scholarship-finder/shared';

export async function getScholarships(params: ScholarshipFilterParams) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const offset = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website, country),
      category:scholarship_categories(id, name, slug, icon_name)
    `, { count: 'exact' });

  // Only published scholarships for public search
  if (params.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.eq('status', 'published');
  }

  // Search keyword in title or description
  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,short_description.ilike.%${term}%`);
  }

  // Category filter
  if (params.category) {
    // Check if UUID or slug
    if (params.category.includes('-') && params.category.length === 36) {
      query = query.eq('category_id', params.category);
    } else {
      const { data: cat } = await supabaseAdmin
        .from('scholarship_categories')
        .select('id')
        .eq('slug', params.category)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }
  }

  // Education level filter
  if (params.education_level) {
    query = query.contains('education_levels', [params.education_level]);
  }

  // Discipline filter
  if (params.discipline) {
    query = query.contains('disciplines', [params.discipline]);
  }

  // Funding range
  if (params.min_funding !== undefined) {
    query = query.gte('funding_amount', params.min_funding);
  }
  if (params.max_funding !== undefined) {
    query = query.lte('funding_amount', params.max_funding);
  }

  // Application status filter (open, closing_soon, etc.)
  const today = new Date().toISOString().split('T')[0];
  if (params.application_status === 'open') {
    query = query.gte('application_deadline', today);
  } else if (params.application_status === 'closing_soon') {
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    query = query.gte('application_deadline', today).lte('application_deadline', sevenDaysLater);
  } else if (params.application_status === 'closed') {
    query = query.lt('application_deadline', today);
  }

  // Sorting
  switch (params.sort_by) {
    case 'deadline':
      query = query.order('application_deadline', { ascending: true, nullsFirst: false });
      break;
    case 'funding_high':
      query = query.order('funding_amount', { ascending: false, nullsFirst: false });
      break;
    case 'funding_low':
      query = query.order('funding_amount', { ascending: true, nullsFirst: false });
      break;
    case 'latest':
    default:
      query = query.order('published_at', { ascending: false, nullsFirst: false });
      break;
  }

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  const meta: PaginationMeta = {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };

  return { scholarships: (data as Scholarship[]) || [], meta };
}

export async function getLatestScholarships(limit = 6): Promise<Scholarship[]> {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website),
      category:scholarship_categories(id, name, slug, icon_name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Scholarship[];
}

export async function getFeaturedScholarships(limit = 6): Promise<Scholarship[]> {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(id, name, slug, provider_type, official_website),
      category:scholarship_categories(id, name, slug, icon_name)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Scholarship[];
}

export async function getScholarshipById(idOrSlug: string): Promise<Scholarship | null> {
  const isUuid = idOrSlug.includes('-') && idOrSlug.length === 36;
  const field = isUuid ? 'id' : 'slug';

  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(*),
      category:scholarship_categories(*),
      criteria:scholarship_eligibility_criteria(*),
      sources:scholarship_sources(*)
    `)
    .eq(field, idOrSlug)
    .single();

  if (error || !data) return null;
  return data as Scholarship;
}

export async function getRelatedScholarships(scholarshipId: string, limit = 4): Promise<Scholarship[]> {
  // First fetch target scholarship category and education levels
  const { data: target } = await supabaseAdmin
    .from('scholarships')
    .select('id, category_id, education_levels')
    .eq('id', scholarshipId)
    .single();

  if (!target) return [];

  let query = supabaseAdmin
    .from('scholarships')
    .select(`
      id, title, slug, short_description, funding_amount, funding_currency,
      application_deadline, is_featured,
      provider:scholarship_providers(name),
      category:scholarship_categories(name)
    `)
    .eq('status', 'published')
    .neq('id', scholarshipId);

  if (target.category_id) {
    query = query.eq('category_id', target.category_id);
  }

  const { data } = await query.limit(limit);
  return (data as unknown as Scholarship[]) || [];
}

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('scholarship_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getProviders() {
  const { data, error } = await supabaseAdmin
    .from('scholarship_providers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
