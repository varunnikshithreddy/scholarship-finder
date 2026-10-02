import { supabaseAdmin } from '../config/supabase';
import { Scholarship, ScholarshipStatus, VerificationStatus } from '@scholarship-finder/shared';

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  oldValues?: any,
  newValues?: any
) {
  try {
    await supabaseAdmin.from('admin_audit_logs').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_values: oldValues || null,
      new_values: newValues || null,
    });
  } catch (err) {
    console.error('[Audit Log] Failed to insert audit log:', err);
  }
}

export async function getAdminOverview() {
  const [
    { count: totalCount },
    { count: publishedCount },
    { count: draftCount },
    { count: providersCount },
    { count: reportsCount },
    { count: assessmentsCount }
  ] = await Promise.all([
    supabaseAdmin.from('scholarships').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('scholarships').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('scholarships').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('scholarship_providers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('scholarship_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabaseAdmin.from('eligibility_assessments').select('*', { count: 'exact', head: true }),
  ]);

  return {
    total_scholarships: totalCount || 0,
    published_scholarships: publishedCount || 0,
    draft_scholarships: draftCount || 0,
    total_providers: providersCount || 0,
    open_reports: reportsCount || 0,
    total_assessments: assessmentsCount || 0,
  };
}

export async function getAllScholarshipsAdmin(page = 1, pageSize = 20, search?: string) {
  let query = supabaseAdmin
    .from('scholarships')
    .select(`
      *,
      provider:scholarship_providers(id, name),
      category:scholarship_categories(id, name)
    `, { count: 'exact' });

  if (search && search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  const offset = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;
  return { scholarships: data || [], total: count || 0 };
}

export async function createScholarshipAdmin(data: any, adminId: string): Promise<Scholarship> {
  const payload = {
    ...data,
    created_by: adminId,
    updated_by: adminId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabaseAdmin
    .from('scholarships')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminId, 'CREATE_SCHOLARSHIP', 'scholarships', created.id, null, created);
  return created as Scholarship;
}

export async function updateScholarshipAdmin(id: string, updates: any, adminId: string): Promise<Scholarship> {
  const { data: existing } = await supabaseAdmin
    .from('scholarships')
    .select('*')
    .eq('id', id)
    .single();

  const payload = {
    ...updates,
    updated_by: adminId,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabaseAdmin
    .from('scholarships')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminId, 'UPDATE_SCHOLARSHIP', 'scholarships', id, existing, updated);
  return updated as Scholarship;
}

export async function archiveScholarshipAdmin(id: string, adminId: string): Promise<Scholarship> {
  return updateScholarshipAdmin(
    id,
    { status: 'archived', archived_at: new Date().toISOString() },
    adminId
  );
}

export async function publishScholarshipAdmin(id: string, adminId: string): Promise<Scholarship> {
  return updateScholarshipAdmin(
    id,
    { status: 'published', published_at: new Date().toISOString() },
    adminId
  );
}

export async function unpublishScholarshipAdmin(id: string, adminId: string): Promise<Scholarship> {
  return updateScholarshipAdmin(
    id,
    { status: 'draft', published_at: null },
    adminId
  );
}

export async function verifyScholarshipAdmin(
  id: string,
  verification_status: VerificationStatus,
  notes: string,
  adminId: string
): Promise<Scholarship> {
  return updateScholarshipAdmin(
    id,
    {
      verification_status,
      source_last_verified_at: new Date().toISOString(),
      source_metadata: { verified_by: adminId, verification_notes: notes }
    },
    adminId
  );
}

export async function getReportsAdmin() {
  const { data, error } = await supabaseAdmin
    .from('scholarship_reports')
    .select(`
      *,
      scholarship:scholarships(id, title, slug),
      reporter:profiles(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateReportStatusAdmin(id: string, status: string, adminId: string) {
  const { data, error } = await supabaseAdmin
    .from('scholarship_reports')
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logAdminAction(adminId, 'UPDATE_REPORT_STATUS', 'scholarship_reports', id, null, { status });
  return data;
}

export async function getAuditLogsAdmin(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
