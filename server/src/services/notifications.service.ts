import { supabaseAdmin } from '../config/supabase';
import { Notification, NotificationPreferences } from '@scholarship-finder/shared';

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select(`
      *,
      scholarship:scholarships(id, title, slug)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as Notification[]) || [];
}

export async function markNotificationRead(userId: string, id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  let { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) {
    const { data: created } = await supabaseAdmin
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select()
      .single();
    data = created;
  }

  return data as NotificationPreferences;
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...prefs,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as NotificationPreferences;
}
