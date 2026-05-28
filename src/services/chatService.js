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

// Returns a { [chatId]: count } map of unread inbound messages for the current
// user. Realtime/RLS scopes `messages` to chats the user belongs to, so we only
// need to exclude the user's own messages and already-read rows.
export async function getUnreadCounts() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  const { data, error } = await supabase
    .from('messages')
    .select('chat_id')
    .eq('read', false)
    .neq('sender_id', user.id);
  if (error) throw error;
  return (data || []).reduce((acc, { chat_id }) => {
    acc[chat_id] = (acc[chat_id] || 0) + 1;
    return acc;
  }, {});
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

// Subscribes to every INSERT on `messages` that this user is allowed to see
// (Realtime respects RLS — the user only receives rows in chats they belong to).
// Messages sent by the current user are filtered out client-side so the caller
// only sees inbound messages.
export function subscribeToInboundMessages(myId, onInsert) {
  if (!myId) return () => {};
  const channel = supabase
    .channel(`inbound-messages-${myId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const msg = payload?.new;
        if (!msg || msg.sender_id === myId) return;
        onInsert(msg);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Resolves enough information to render an in-app notification banner
// for a freshly inserted message: the sender's profile and the chat id.
export async function getMessageBannerInfo(msg) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', msg.sender_id)
    .maybeSingle();
  if (error) {
    return { chatId: msg.chat_id, text: msg.text, other: null };
  }
  return { chatId: msg.chat_id, text: msg.text, other: data || null };
}
