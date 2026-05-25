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

export async function searchUsers(q) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city')
    .ilike('full_name', `%${q}%`)
    .limit(20);
  if (error) throw error;
  return data;
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
