import { supabase } from '../lib/supabase';

export async function getChats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('chats')
    .select(
      `
      id, last_message, updated_at,
      user_a_profile:profiles!chats_user_a_fkey(id, full_name, avatar_url),
      user_b_profile:profiles!chats_user_b_fkey(id, full_name, avatar_url)
    `,
    )
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    other:
      c.user_a_profile.id === user.id ? c.user_b_profile : c.user_a_profile,
    lastMessage: c.last_message,
    updatedAt: c.updated_at,
  }));
}

export async function openChat(otherUserId) {
  const { data, error } = await supabase.rpc('get_or_create_chat', {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data;
}

export async function getMessages(chatId, { offset = 0, limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data.reverse();
}

export async function sendMessage(chatId, text) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, sender_id: user.id, text })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markRead(chatId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', chatId)
    .neq('sender_id', user.id)
    .eq('read', false);
}
