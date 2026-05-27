import { supabase } from '../lib/supabase';

const VIDEO_EXT = ['mp4', 'mov', 'm4v', 'webm', '3gp'];

const guessExt = (uri, fallback = 'jpg') => {
  const clean = uri.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot === -1) return fallback;
  const ext = clean.slice(dot + 1).toLowerCase();
  return ext.length <= 5 ? ext : fallback;
};

const inferContentType = (ext, explicit) => {
  if (explicit) return explicit;
  if (VIDEO_EXT.includes(ext)) {
    if (ext === 'mov') return 'video/quicktime';
    if (ext === '3gp') return 'video/3gpp';
    return `video/${ext}`;
  }
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return `image/${ext}`;
  return 'image/jpeg';
};

async function readAsArrayBuffer(uri) {
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Response(blob).arrayBuffer();
}

export async function uploadMedia({ uri, bucket, fileName, contentType }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to upload.');

  const ext = guessExt(uri, fileName?.includes('.') ? fileName.split('.').pop() : 'jpg');
  const safeName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'media';
  const path = `${user.id}/${Date.now()}-${safeName}.${ext}`;
  const type = inferContentType(ext, contentType);
  const bytes = await readAsArrayBuffer(uri);

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadImage = uploadMedia;

export const uploadAvatar = (uri) =>
  uploadMedia({ uri, bucket: 'avatars', fileName: 'avatar', contentType: 'image/jpeg' });

export const uploadPostImage = (uri) =>
  uploadMedia({ uri, bucket: 'posts', fileName: 'post' });

export const uploadPostMedia = (uri, type) =>
  uploadMedia({
    uri,
    bucket: 'posts',
    fileName: type === 'video' ? 'video' : 'photo',
  });
