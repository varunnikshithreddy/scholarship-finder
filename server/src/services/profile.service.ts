import { supabaseAdmin } from '../config/supabase';
import { Profile, UserProfileInput } from '@scholarship-finder/shared';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(userId: string, input: UserProfileInput): Promise<Profile> {
  // Determine if profile meets completion criteria
  const isComplete = Boolean(
    input.education_level &&
    input.discipline &&
    input.academic_score !== undefined &&
    input.state
  );

  const payload: any = {
    ...input,
    updated_at: new Date().toISOString()
  };

  if (isComplete) {
    payload.profile_completed = true;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function deleteProfile(userId: string): Promise<boolean> {
  // RLS cascading delete will delete saved_scholarships, notifications, assessments
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;

  // Also remove auth user record via admin
  await supabaseAdmin.auth.admin.deleteUser(userId);
  return true;
}
