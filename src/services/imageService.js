import { supabase } from '../lib/supabase';

async function readAsArrayBuffer(uri) {
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Response(blob).arrayBuffer();
}

export async function uploadImage({ uri, bucket, fileName }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = `${user.id}/${Date.now()}-${fileName}`;
  const bytes = await readAsArrayBuffer(uri);

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadAvatar = (uri) =>
  uploadImage({ uri, bucket: 'avatars', fileName: 'avatar.jpg' });

export const uploadPostImage = (uri) =>
  uploadImage({ uri, bucket: 'posts', fileName: 'post.jpg' });
