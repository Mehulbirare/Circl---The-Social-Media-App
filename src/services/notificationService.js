import { supabase } from '../lib/supabase';

export async function getNotifications() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markAllAsRead() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;
}

export async function createNotification({ userId, type, postId, text }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Don't notify yourself
  if (user.id === userId) return null;

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      sender_id: user.id,
      type,
      post_id: postId,
      text,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUnreadCount() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) return 0;
  return count || 0;
}
