import { supabase } from '../lib/supabase';

const VIDEO_EXT = ['mp4', 'mov', 'm4v', 'webm', '3gp'];

const guessExt = (uri, fallback = 'jpg') => {
  if (!uri) return fallback;
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

const normalizeUri = (uri) => {
  if (!uri) return uri;
  return uri.startsWith('/') ? `file://${uri}` : uri;
};

async function readAsBlob(uri) {
  const res = await fetch(normalizeUri(uri));
  return await res.blob();
}

function xhrPut({ url, blob, headers, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    if (xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total, e.loaded, e.total);
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || 'unknown error'}`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed: network error'));
    xhr.onabort = () => {
      const err = new Error('Upload cancelled');
      err.code = 'ABORTED';
      reject(err);
    };
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener('abort', () => xhr.abort());
    }
    xhr.send(blob);
  });
}

export async function uploadMedia({
  uri,
  bucket,
  path,
  fileName,
  contentType,
  onProgress,
  signal,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to upload.');

  const ext = guessExt(uri, fileName?.includes('.') ? fileName.split('.').pop() : 'jpg');
  const safeName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'media';
  const finalPath = path || `${user.id}/${Date.now()}-${safeName}.${ext}`;
  const type = inferContentType(ext, contentType);

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(finalPath);
  if (signErr) throw signErr;

  const blob = await readAsBlob(uri);

  await xhrPut({
    url: signed.signedUrl,
    blob,
    headers: {
      'Content-Type': type,
      'x-upsert': 'false',
    },
    onProgress,
    signal,
  });

  const { data } = supabase.storage.from(bucket).getPublicUrl(finalPath);
  return { url: data.publicUrl, path: finalPath };
}

export const uploadImage = async (args) => (await uploadMedia(args)).url;

export const uploadAvatar = async (uri) =>
  (
    await uploadMedia({
      uri,
      bucket: 'avatars',
      fileName: 'avatar',
      contentType: 'image/jpeg',
    })
  ).url;

export const uploadPostImage = async (uri) =>
  (await uploadMedia({ uri, bucket: 'posts', fileName: 'post' })).url;

export const uploadPostMedia = async (uri, type, opts = {}) => {
  const { onProgress, signal } = opts;
  return uploadMedia({
    uri,
    bucket: 'posts',
    fileName: type === 'video' ? 'video' : 'photo',
    onProgress,
    signal,
  });
};

export const uploadThumbnailForVideo = async (uri, videoPath) => {
  const thumbPath = videoPath.replace(/\.[^.]+$/, '.jpg');
  return uploadMedia({
    uri,
    bucket: 'posts',
    path: thumbPath,
    contentType: 'image/jpeg',
  });
};

export const thumbnailUrlForVideoUrl = (videoUrl) => {
  if (!videoUrl) return null;
  return videoUrl.replace(/\.(mp4|mov|m4v|webm|3gp)(\?|$)/i, '.jpg$2');
};
