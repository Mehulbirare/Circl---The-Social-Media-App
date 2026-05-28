import { supabase } from '../lib/supabase';

export async function getFeed({ lat, lng, radiusKm = 5, offset = 0, limit = 20 }) {
  const { data, error } = await supabase.rpc('nearby_posts', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
    page_offset: offset,
    page_limit: limit,
  });
  if (error) throw error;
  return data;
}

export async function createPost({ text, imageUrl, lat, lng }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      text,
      image_url: imageUrl,
      lat,
      lng,
      location: `POINT(${lng} ${lat})`,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPostsByAuthor(userId, { offset = 0, limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function getPost(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('id', postId)
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function toggleLike(postId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: existing } = await supabase
    .from('post_likes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    return false;
  }
  await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: user.id });
  return true;
}

export async function hasLiked(postId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();
  return !!data;
}

export async function getComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, text, created_at, author:profiles(id, full_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addComment(postId, text) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, text })
    .select('*, author:profiles(id, full_name, avatar_url)')
    .single();
  if (error) throw error;
  return data;
}
