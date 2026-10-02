import { supabaseAdmin } from '../config/supabase';
import { ApplicationStatus, SavedScholarship } from '@scholarship-finder/shared';

export async function getSavedScholarships(userId: string): Promise<SavedScholarship[]> {
  const { data, error } = await supabaseAdmin
    .from('saved_scholarships')
    .select(`
      *,
      scholarship:scholarships(
        id, title, slug, short_description, funding_amount, funding_currency,
        application_start_date, application_deadline, official_application_url,
        official_source_url, status,
        provider:scholarship_providers(name)
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as SavedScholarship[]) || [];
}

export async function saveScholarship(
  userId: string,
  scholarshipId: string,
  status: ApplicationStatus = 'interested',
  note?: string
): Promise<SavedScholarship> {
  const { data, error } = await supabaseAdmin
    .from('saved_scholarships')
    .upsert({
      user_id: userId,
      scholarship_id: scholarshipId,
      application_status: status,
      personal_note: note || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,scholarship_id' })
    .select(`
      *,
      scholarship:scholarships(id, title, slug, funding_amount, application_deadline)
    `)
    .single();

  if (error) throw error;
  return data as unknown as SavedScholarship;
}

export async function updateSavedScholarship(
  userId: string,
  id: string,
  status?: ApplicationStatus,
  note?: string
): Promise<SavedScholarship> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (status) payload.application_status = status;
  if (note !== undefined) payload.personal_note = note;

  const { data, error } = await supabaseAdmin
    .from('saved_scholarships')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as SavedScholarship;
}

export async function removeSavedScholarship(userId: string, id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('saved_scholarships')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
