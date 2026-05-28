import { supabase } from '../lib/supabase';

export async function getNearbyUsers({ lat, lng, radiusKm = 5 }) {
  const { data, error } = await supabase.rpc('nearby_users', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  });
  if (error) throw error;
  return data;
}

export async function getAllUsers({ limit = 200 } = {}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city')
    .order('full_name', { ascending: true })
    .limit(limit);
  if (user) query = query.neq('id', user.id);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function searchUsers(q) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city')
    .ilike('full_name', `%${q}%`)
    .limit(20);
  if (error) throw error;
  return data;
}

export async function getFollowing(userId) {
  let targetId = userId;
  if (!targetId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetId = user.id;
  }
  const { data: rows, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', targetId);
  if (error) throw error;
  const ids = (rows || []).map((r) => r.following_id);
  if (ids.length === 0) return [];
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city')
    .in('id', ids);
  if (pErr) throw pErr;
  return profiles || [];
}

export async function getFollowers(userId) {
  let targetId = userId;
  if (!targetId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetId = user.id;
  }
  const { data: rows, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', targetId);
  if (error) throw error;
  const ids = (rows || []).map((r) => r.follower_id);
  if (ids.length === 0) return [];
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city')
    .in('id', ids);
  if (pErr) throw pErr;
  return profiles || [];
}

export async function follow(userId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: userId });
  if (error) throw error;
}

export async function unfollow(userId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId);
  if (error) throw error;
}

export async function isFollowing(userId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .maybeSingle();
  return !!data;
}
