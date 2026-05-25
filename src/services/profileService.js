import { supabase } from '../lib/supabase';

export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const update = { ...patch, updated_at: new Date().toISOString() };
  if (patch.lat != null && patch.lng != null) {
    update.location = `POINT(${patch.lng} ${patch.lat})`;
  }
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfileStats(userId) {
  const [
    { count: posts },
    { count: followers },
    { count: following },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId),
    supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('following_id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);
  return {
    posts: posts ?? 0,
    followers: followers ?? 0,
    following: following ?? 0,
  };
}
