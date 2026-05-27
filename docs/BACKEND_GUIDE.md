# Circl — Complete Backend Implementation Guide

> **For beginners:** This document explains, from zero, how to add a backend to the **Circl** React Native app. You don't need any backend knowledge — every step, every query, every line of code you need is here.

---

## Table of Contents

1. [What is a backend? (5-minute primer)](#1-what-is-a-backend-5-minute-primer)
2. [Recommended stack — Supabase (100% free)](#2-recommended-stack--supabase-100-free)
3. [Why Supabase (vs Firebase / others)](#3-why-supabase-vs-firebase--others)
4. [The complete data model](#4-the-complete-data-model)
5. [Step-by-step: create your Supabase project](#5-step-by-step-create-your-supabase-project)
6. [Database schema — every SQL query to run](#6-database-schema--every-sql-query-to-run)
7. [Row Level Security (RLS) policies](#7-row-level-security-rls-policies)
8. [Storage buckets (images) setup](#8-storage-buckets-images-setup)
9. [Install the Supabase client in your app](#9-install-the-supabase-client-in-your-app)
10. [Authentication — Welcome / Login / Signup](#10-authentication--welcome--login--signup)
11. [Service layer — every API call mapped to a screen](#11-service-layer--every-api-call-mapped-to-a-screen)
12. [Realtime chat (Supabase Realtime)](#12-realtime-chat-supabase-realtime)
13. [Image upload (avatar + post images)](#13-image-upload-avatar--post-images)
14. [Push notifications (free — Expo / FCM)](#14-push-notifications-free--expo--fcm)
15. [Wiring it up — file-by-file changes in the existing code](#15-wiring-it-up--file-by-file-changes-in-the-existing-code)
16. [Persisting auth across app restarts](#16-persisting-auth-across-app-restarts)
17. [Testing checklist](#17-testing-checklist)
18. [Free tier limits & when to upgrade](#18-free-tier-limits--when-to-upgrade)

---

## 1. What is a backend? (5-minute primer)

Right now Circl shows **mock data** hard-coded in the screens. When you close the app, anything you "posted" disappears. A backend solves three problems:

| Problem | What the backend does |
|---|---|
| Where does data live? | A **database** (e.g. PostgreSQL) stores users, posts, messages permanently |
| How does the app talk to it? | An **API** (HTTP endpoints) the app calls — e.g. `GET /posts` returns posts |
| Who is allowed to do what? | **Authentication** (login) + **authorization** (rules: "only the author can delete their own post") |

You have two ways to build this:

1. **Write your own server** (Node.js + Express + PostgreSQL + S3 + WebSocket server + ...). Months of work, you have to deploy/maintain it, and free hosting is limited.
2. **Use a Backend-as-a-Service (BaaS)** — a hosted platform that gives you database + auth + storage + realtime out of the box. You only write the client-side code.

**We will use option 2 — Supabase.** It's the modern, free, open-source alternative to Firebase.

---

## 2. Recommended stack — Supabase (100% free)

| Need | Service | Free tier |
|---|---|---|
| Database | **Supabase** Postgres (with PostGIS for "posts within 5 km") | 500 MB, 2 projects |
| Authentication | **Supabase Auth** (email/password + Google/Apple OAuth) | 50,000 monthly active users |
| Image storage | **Supabase Storage** (avatars, post images) | 1 GB |
| Realtime chat & feed | **Supabase Realtime** (WebSockets) | 200 concurrent connections, 2M messages/month |
| Map tiles | **OpenStreetMap** via `react-native-maps` default provider | Unlimited, free, no API key |
| Push notifications | **Expo Push Notifications** or **Firebase Cloud Messaging (FCM)** | Unlimited free |
| Geocoding (city/region from lat/lng) | **Nominatim** (OpenStreetMap) | Free, rate-limited to 1 req/sec |

> ✅ **Everything above is free with no credit card.** You can build, ship and run Circl to thousands of users without paying a cent.

---

## 3. Why Supabase (vs Firebase / others)

| Feature | Supabase | Firebase | Appwrite |
|---|---|---|---|
| Database | **PostgreSQL** (real SQL, relations, joins) | Firestore (NoSQL, awkward for joins) | MariaDB |
| Geospatial queries ("posts within 5 km") | ✅ **PostGIS built-in** | ❌ Complex / paid extensions | ⚠️ Limited |
| Realtime | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Free tier (DB size) | 500 MB | 1 GB but reads/writes capped | 75K reads/day |
| Vendor lock-in | Low (it's just Postgres) | High | Low (open source) |
| React Native SDK | Excellent | Excellent | Good |

**Circl needs location queries (the whole app is "what's nearby") — that decides it: Supabase with PostGIS.**

---

## 4. The complete data model

These are the database tables you'll create. They map directly to the entities already in your code.

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   profiles   │◄────────│    posts     │◄────────│   comments   │
│  (user info) │  author │              │  on     │              │
└──────┬───────┘         └──────┬───────┘         └──────────────┘
       │                        │
       │                        │ likes
       │                        ▼
       │                 ┌──────────────┐
       │                 │  post_likes  │
       │                 └──────────────┘
       │
       │ follows
       ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   follows    │         │    chats     │◄────────│   messages   │
└──────────────┘         └──────────────┘         └──────────────┘
```

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | Extra user info beyond auth (name, avatar, bio, location) | `id` (FK to auth.users), `full_name`, `avatar_url`, `bio`, `dob`, `gender`, `city`, `region`, `lat`, `lng` |
| `posts` | Local posts | `id`, `author_id`, `text`, `image_url`, `lat`, `lng`, `location` (PostGIS geography), `created_at` |
| `post_likes` | Who liked which post | `post_id`, `user_id` (composite PK) |
| `comments` | Comments on posts | `id`, `post_id`, `author_id`, `text`, `created_at` |
| `follows` | Follow graph | `follower_id`, `following_id` (composite PK) |
| `chats` | Conversation between 2 users (auto-managed) | `id`, `user_a`, `user_b`, `last_message`, `updated_at` |
| `messages` | Individual chat messages | `id`, `chat_id`, `sender_id`, `text`, `read`, `created_at` |
| `topics` | Trending hashtag rollup (optional, derived) | `tag`, `post_count`, `city` |

---

## 5. Step-by-step: create your Supabase project

1. Go to **https://supabase.com** → click **Start your project** → sign in with GitHub.
2. Click **New project**. Pick a name (`circl`), a strong DB password (save it!), and the region closest to your users (for India: **Mumbai** / **Singapore**).
3. Wait ~2 minutes for provisioning.
4. Once ready, open the project. From the left sidebar grab two values you'll need:
   - **Project URL** — Settings → API → `Project URL`
   - **anon public key** — Settings → API → `anon` `public` key

   These two strings are what your React Native app uses to talk to Supabase. The `anon` key is safe to ship in the app (Row Level Security protects the data, see Section 7).

5. Optional but recommended: **Enable PostGIS extension** so location queries work:
   - Left sidebar → **Database** → **Extensions** → search `postgis` → toggle **Enable**.

---

## 6. Database schema — every SQL query to run

Open **SQL Editor** in Supabase (left sidebar) and run these blocks **in order**. Each block is independent — paste, click **Run**, move on.

### 6.1 Enable PostGIS (skip if you did it via the UI)

```sql
create extension if not exists postgis;
```

### 6.2 `profiles` table

Supabase Auth automatically creates a row in `auth.users` when someone signs up. We mirror it into a public `profiles` table so we can join it from other tables.

```sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text unique not null,
  avatar_url   text,
  bio          text default '',
  dob          date,
  gender       text check (gender in ('male','female','other')),
  mobile       text,
  city         text default 'Surat',
  region       text default 'Gujarat',
  lat          double precision,
  lng          double precision,
  location     geography(point, 4326),  -- PostGIS column for nearby queries
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Index for nearby queries
create index profiles_location_idx on public.profiles using gist (location);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 6.3 `posts` table

```sql
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  text        text not null check (char_length(text) <= 280),
  image_url   text,
  lat         double precision not null,
  lng         double precision not null,
  location    geography(point, 4326) not null,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at  timestamptz default now()
);

create index posts_location_idx on public.posts using gist (location);
create index posts_author_idx on public.posts (author_id);
create index posts_created_idx on public.posts (created_at desc);
```

### 6.4 `post_likes` table

```sql
create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Keep likes_count in sync automatically
create or replace function public.update_post_likes_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger post_likes_count_trg
  after insert or delete on public.post_likes
  for each row execute procedure public.update_post_likes_count();
```

### 6.5 `comments` table

```sql
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  text       text not null check (char_length(text) <= 500),
  created_at timestamptz default now()
);

create index comments_post_idx on public.comments (post_id, created_at desc);

-- keep comments_count in sync
create or replace function public.update_comments_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_count_trg
  after insert or delete on public.comments
  for each row execute procedure public.update_comments_count();
```

### 6.6 `follows` table

```sql
create table public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
```

### 6.7 `chats` + `messages` tables

```sql
create table public.chats (
  id           uuid primary key default gen_random_uuid(),
  user_a       uuid not null references public.profiles(id) on delete cascade,
  user_b       uuid not null references public.profiles(id) on delete cascade,
  last_message text default '',
  updated_at   timestamptz default now(),
  unique (user_a, user_b),
  check (user_a < user_b)   -- canonical ordering so (A,B) and (B,A) collapse to one row
);

create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  chat_id    uuid not null references public.chats(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  text       text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

create index messages_chat_idx on public.messages (chat_id, created_at desc);

-- Update chats.last_message on new message
create or replace function public.update_chat_last_message()
returns trigger language plpgsql as $$
begin
  update public.chats
     set last_message = new.text, updated_at = now()
   where id = new.chat_id;
  return new;
end;
$$;

create trigger chats_last_message_trg
  after insert on public.messages
  for each row execute procedure public.update_chat_last_message();
```

### 6.8 Helper RPC: `nearby_posts`

The cornerstone of Circl — given user's lat/lng + radius, return posts inside that radius, sorted by recency.

```sql
create or replace function public.nearby_posts(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 5,
  page_offset integer default 0,
  page_limit integer default 20
)
returns table (
  id uuid,
  author_id uuid,
  author_name text,
  author_avatar text,
  text text,
  image_url text,
  distance_km double precision,
  likes_count integer,
  comments_count integer,
  created_at timestamptz
)
language sql stable as $$
  select
    p.id,
    p.author_id,
    pr.full_name as author_name,
    pr.avatar_url as author_avatar,
    p.text,
    p.image_url,
    st_distance(p.location, st_makepoint(user_lng, user_lat)::geography) / 1000.0 as distance_km,
    p.likes_count,
    p.comments_count,
    p.created_at
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where st_dwithin(
    p.location,
    st_makepoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  order by p.created_at desc
  offset page_offset
  limit page_limit;
$$;
```

### 6.9 Helper RPC: `nearby_users`

```sql
create or replace function public.nearby_users(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 5
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  distance_km double precision
)
language sql stable as $$
  select
    pr.id,
    pr.full_name,
    pr.avatar_url,
    pr.bio,
    st_distance(pr.location, st_makepoint(user_lng, user_lat)::geography) / 1000.0 as distance_km
  from public.profiles pr
  where pr.location is not null
    and pr.id <> auth.uid()
    and st_dwithin(
      pr.location,
      st_makepoint(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  order by distance_km asc
  limit 50;
$$;
```

### 6.10 Helper RPC: `get_or_create_chat`

```sql
create or replace function public.get_or_create_chat(other_user_id uuid)
returns uuid language plpgsql security definer as $$
declare
  me uuid := auth.uid();
  a uuid;
  b uuid;
  cid uuid;
begin
  if me is null then raise exception 'Not authenticated'; end if;
  if me < other_user_id then a := me; b := other_user_id;
  else                       a := other_user_id; b := me;
  end if;

  select id into cid from public.chats where user_a = a and user_b = b;
  if cid is null then
    insert into public.chats (user_a, user_b) values (a, b) returning id into cid;
  end if;
  return cid;
end;
$$;
```

---

## 7. Row Level Security (RLS) policies

RLS = "this row is only visible / editable to certain users". Without policies, the `anon` key in your app would expose **all** data. **Enable RLS on every table** and add policies.

```sql
-- Enable RLS
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.post_likes  enable row level security;
alter table public.comments    enable row level security;
alter table public.follows     enable row level security;
alter table public.chats       enable row level security;
alter table public.messages    enable row level security;

-- PROFILES: anyone signed in can read; only the owner can update
create policy "profiles_select" on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- POSTS: anyone signed in can read; only author can write/delete
create policy "posts_select" on public.posts for select using (auth.role() = 'authenticated');
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

-- POST_LIKES: read public; users can only like/unlike for themselves
create policy "likes_select" on public.post_likes for select using (auth.role() = 'authenticated');
create policy "likes_insert" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.post_likes for delete using (auth.uid() = user_id);

-- COMMENTS: read public; only author can write/delete own comment
create policy "comments_select" on public.comments for select using (auth.role() = 'authenticated');
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = author_id);

-- FOLLOWS: anyone signed in can read; only owner can create/delete their own follow
create policy "follows_select" on public.follows for select using (auth.role() = 'authenticated');
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- CHATS: only the two participants can read or update
create policy "chats_select" on public.chats for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- MESSAGES: only the two chat participants can read; only sender can insert
create policy "messages_select" on public.messages for select using (
  exists (select 1 from public.chats c
          where c.id = messages.chat_id
            and (auth.uid() = c.user_a or auth.uid() = c.user_b))
);
create policy "messages_insert" on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.chats c
    where c.id = messages.chat_id
      and (auth.uid() = c.user_a or auth.uid() = c.user_b)
  )
);
```

---

## 8. Storage buckets (images) setup

In Supabase → **Storage** → **Create bucket**:

| Bucket name | Public? | Purpose |
|---|---|---|
| `avatars` | ✅ Yes | Profile pictures |
| `posts` | ✅ Yes | Images attached to posts |

**Policies** (Storage → Policies → New policy → "For full customization"):

```sql
-- avatars: anyone authenticated can read; user can write only into folder = their user id
create policy "avatar_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatar_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- posts: same pattern
create policy "post_read" on storage.objects for select using (bucket_id = 'posts');
create policy "post_write" on storage.objects for insert
  with check (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);
```

Path convention: `<user_id>/<filename>` — e.g. `avatars/8e3a.../profile.jpg`.

---

## 9. Install the Supabase client in your app

From your project root (`c:/Users/mehul/Desktop/NetQc/Circl`):

```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

`react-native-url-polyfill` is required because React Native doesn't ship a full `URL` implementation.

Then create the client at **`src/lib/supabase.js`**:

```js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

> 🔒 **Never commit secrets.** For Circl the `anon` key is okay to ship (RLS protects data) but in larger projects store it in `react-native-config` `.env`.

---

## 10. Authentication — Welcome / Login / Signup

### 10.1 Service module — `src/services/authService.js`

```js
import { supabase } from '../lib/supabase';

export async function signUp({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },  // saved into raw_user_meta_data → profile trigger picks it up
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
```

### 10.2 SignupScreen — replace the dummy login with:

```js
import { signUp } from '../../services/authService';
import { updateProfile } from '../../services/profileService'; // see §11

// inside handleSignup:
try {
  setLoading(true);
  await signUp({ fullName: name, email, password });
  // After signUp, if email confirmation is OFF (default in Supabase dev), user is signed in.
  // Trigger §6.2 already created the profile row.
  // Now save the location captured earlier:
  await updateProfile({ lat: coords.lat, lng: coords.lng, city, region });
} catch (e) {
  Alert.alert('Sign up failed', e.message);
} finally {
  setLoading(false);
}
```

> ℹ️ In **Authentication → Providers** turn **Confirm email** off during development. Turn it back on before launch.

### 10.3 LoginScreen — same pattern, calls `signIn(...)`.

### 10.4 Wire OAuth (Google / Apple) — optional, free

In Supabase **Authentication → Providers**:
- Enable **Google** → get credentials from Google Cloud Console (free).
- Enable **Apple** → only needed for iOS production.

Client call:
```js
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

---

## 11. Service layer — every API call mapped to a screen

Create one file per domain under `src/services/`. Every screen calls these — no Supabase calls in the screens themselves.

### 11.1 `src/services/profileService.js`

```js
import { supabase } from '../lib/supabase';

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch) {
  const { data: { user } } = await supabase.auth.getUser();
  // Build PostGIS point if lat/lng provided
  const update = { ...patch, updated_at: new Date().toISOString() };
  if (patch.lat != null && patch.lng != null) {
    update.location = `POINT(${patch.lng} ${patch.lat})`;
  }
  const { data, error } = await supabase
    .from('profiles').update(update).eq('id', user.id).select().single();
  if (error) throw error;
  return data;
}

export async function getProfileStats(userId) {
  const [{ count: posts }, { count: followers }, { count: following }] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { posts: posts ?? 0, followers: followers ?? 0, following: following ?? 0 };
}
```

### 11.2 `src/services/postsService.js`

```js
import { supabase } from '../lib/supabase';

// HomeScreen — local feed
export async function getFeed({ lat, lng, radiusKm = 5, offset = 0, limit = 20 }) {
  const { data, error } = await supabase.rpc('nearby_posts', {
    user_lat: lat, user_lng: lng, radius_km: radiusKm,
    page_offset: offset, page_limit: limit,
  });
  if (error) throw error;
  return data;
}

// CreatePostScreen
export async function createPost({ text, imageUrl, lat, lng }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('posts').insert({
    author_id: user.id, text, image_url: imageUrl,
    lat, lng, location: `POINT(${lng} ${lat})`,
  }).select().single();
  if (error) throw error;
  return data;
}

// PostDetailScreen
export async function getPost(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('id', postId).single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

// PostActions
export async function toggleLike(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: existing } = await supabase
    .from('post_likes').select().eq('post_id', postId).eq('user_id', user.id).maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    return false;  // now unliked
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    return true;   // now liked
  }
}

export async function hasLiked(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('post_likes').select('post_id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
  return !!data;
}

// Comments
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
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('comments').insert({
    post_id: postId, author_id: user.id, text,
  }).select('*, author:profiles(id, full_name, avatar_url)').single();
  if (error) throw error;
  return data;
}
```

### 11.3 `src/services/usersService.js` — Explore, follow

```js
import { supabase } from '../lib/supabase';

export async function getNearbyUsers({ lat, lng, radiusKm = 5 }) {
  const { data, error } = await supabase.rpc('nearby_users', {
    user_lat: lat, user_lng: lng, radius_km: radiusKm,
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
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('follows').insert({
    follower_id: user.id, following_id: userId,
  });
  if (error) throw error;
}

export async function unfollow(userId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follows').delete()
    .eq('follower_id', user.id).eq('following_id', userId);
  if (error) throw error;
}

export async function isFollowing(userId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('follows').select('follower_id')
    .eq('follower_id', user.id).eq('following_id', userId).maybeSingle();
  return !!data;
}
```

### 11.4 `src/services/chatService.js`

```js
import { supabase } from '../lib/supabase';

// ChatScreen — list conversations
export async function getChats() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id, last_message, updated_at,
      user_a_profile:profiles!chats_user_a_fkey(id, full_name, avatar_url),
      user_b_profile:profiles!chats_user_b_fkey(id, full_name, avatar_url)
    `)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  // Pick the "other" user for the UI
  return data.map(c => ({
    id: c.id,
    other: c.user_a_profile.id === user.id ? c.user_b_profile : c.user_a_profile,
    lastMessage: c.last_message,
    updatedAt: c.updated_at,
  }));
}

export async function openChat(otherUserId) {
  const { data, error } = await supabase.rpc('get_or_create_chat', { other_user_id: otherUserId });
  if (error) throw error;
  return data;  // chat id
}

export async function getMessages(chatId, { offset = 0, limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('messages').select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data.reverse();
}

export async function sendMessage(chatId, text) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('messages').insert({
    chat_id: chatId, sender_id: user.id, text,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function markRead(chatId) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('messages').update({ read: true })
    .eq('chat_id', chatId).neq('sender_id', user.id).eq('read', false);
}
```

### 11.5 Endpoint cheat sheet — what each screen calls

| Screen | Calls |
|---|---|
| **WelcomeScreen** | _(no backend)_ |
| **SignupScreen** | `signUp()` → `updateProfile({ lat, lng })` |
| **LoginScreen** | `signIn()` |
| **HomeScreen** | `getFeed({ lat, lng, radiusKm })` + realtime subscription on `posts` |
| **ExploreScreen** | `getNearbyUsers()`, `follow()`/`unfollow()` |
| **CreatePostScreen** | `uploadPostImage()` (§13), `createPost()` |
| **ChatScreen** (list) | `getChats()` |
| **ChatThreadScreen** (new — see §15) | `openChat()`, `getMessages()`, `sendMessage()`, realtime subscription on `messages` |
| **ProfileScreen** | `getMyProfile()`, `getProfileStats()` |
| **EditProfileScreen** | `uploadAvatar()` (§13), `updateProfile()` |
| **SettingsScreen** | `updateProfile()` (preferences columns), `signOut()` |
| **PostDetailScreen** | `getPost()`, `getComments()`, `addComment()`, `toggleLike()` |

---

## 12. Realtime chat (Supabase Realtime)

Supabase Realtime is a WebSocket layer that pushes row changes to subscribed clients.

**Enable it** for the tables you want: Supabase → **Database** → **Replication** → toggle on `messages` and (optional) `posts`.

### Subscribe inside ChatThreadScreen:

```js
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function ChatThreadScreen({ route }) {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 1. Initial load
    getMessages(chatId).then(setMessages);

    // 2. Subscribe to new messages
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  // ... render
}
```

Same pattern works for the live feed (subscribe to `posts` filtered by proximity — though for the feed it's usually fine to just `getFeed()` on pull-to-refresh).

---

## 13. Image upload (avatar + post images)

`react-native-image-picker` is already installed. The flow is:
1. User picks an image → you get a local file URI.
2. Read it as bytes, upload to Supabase Storage.
3. Save the resulting **public URL** in the `avatar_url` or `posts.image_url` column.

### `src/services/imageService.js`

```js
import { supabase } from '../lib/supabase';

async function readAsArrayBuffer(uri) {
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Response(blob).arrayBuffer();
}

export async function uploadImage({ uri, bucket, fileName }) {
  const { data: { user } } = await supabase.auth.getUser();
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

export const uploadAvatar    = (uri) => uploadImage({ uri, bucket: 'avatars', fileName: 'avatar.jpg' });
export const uploadPostImage = (uri) => uploadImage({ uri, bucket: 'posts',   fileName: 'post.jpg'   });
```

### Use in EditProfileScreen:

```js
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadAvatar } from '../../services/imageService';
import { updateProfile } from '../../services/profileService';

async function pickAndUpload() {
  const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
  if (result.didCancel) return;
  const uri = result.assets[0].uri;
  const url = await uploadAvatar(uri);
  await updateProfile({ avatar_url: url });
}
```

---

## 14. Push notifications (free — Expo / FCM)

Easiest free option: **Expo Push Notifications** (works with bare React Native too).

1. `npm install expo-notifications expo-device`
2. Get the device's push token, save it to a new column `profiles.push_token`.
3. On the backend side, when you insert a new message/comment, call Expo's free API:
   `POST https://exp.host/--/api/v2/push/send`

You can call it from a **Supabase Edge Function** (free, written in TypeScript, deploys with `supabase functions deploy`). Example trigger: a database webhook that fires on `messages` insert and posts to Expo.

> 📌 If push notifications feel like too much for v1, skip it. Realtime (§12) gives a great in-app experience while the app is open.

---

## 15. Wiring it up — file-by-file changes in the existing code

Here is exactly what to add/change in your current codebase.

| File | Change |
|---|---|
| `src/lib/supabase.js` | **New** — §9 |
| `src/services/authService.js` | **New** — §10.1 |
| `src/services/profileService.js` | **New** — §11.1 |
| `src/services/postsService.js` | **New** — §11.2 |
| `src/services/usersService.js` | **New** — §11.3 |
| `src/services/chatService.js` | **New** — §11.4 |
| `src/services/imageService.js` | **New** — §13 |
| `src/store/useAuthStore.js` | Add `hydrate()` that calls `getSession()` and sets `user`. Add session listener via `onAuthChange()`. |
| `src/store/usePostStore.js` | Replace `addPost` to call `postsService.createPost(...)`. Add `loadFeed({lat,lng})`. |
| `src/store/useLocationStore.js` | After signup/login, fetch device location with `@react-native-community/geolocation`, then call `updateProfile({lat,lng})`. |
| `App.jsx` | On mount, call `useAuthStore.hydrate()` and subscribe to auth changes; show a loader until hydration finishes. |
| `src/screens/auth/SignupScreen.jsx` | Replace dummy login with `signUp()` + `updateProfile()`. |
| `src/screens/auth/LoginScreen.jsx` | Replace dummy login with `signIn()`. |
| `src/screens/main/HomeScreen.jsx` | Replace `MOCK_POSTS` with `getFeed({lat,lng})`. Add pull-to-refresh wired to `loadFeed`. |
| `src/screens/main/CreatePostScreen.jsx` | Call `uploadPostImage()` (if image) then `createPost()`. |
| `src/screens/main/ExploreScreen.jsx` | Replace mock with `getNearbyUsers()` + `follow()`/`unfollow()`. |
| `src/screens/main/ChatScreen.jsx` | Replace mock with `getChats()`. Tap row → navigate to new `ChatThreadScreen`. |
| `src/screens/main/ChatThreadScreen.jsx` | **New** — message thread with realtime (§12). Add to MainNavigator. |
| `src/screens/main/ProfileScreen.jsx` | Replace hard-coded stats with `getMyProfile()` + `getProfileStats()`. Logout calls `signOut()`. |
| `src/screens/modal/EditProfileScreen.jsx` | Wire avatar picker → `uploadAvatar()` → `updateProfile()`. Save button calls `updateProfile()`. |
| `src/screens/modal/PostDetailScreen.jsx` | Replace mock comments with `getComments()` + `addComment()`. |

---

## 16. Persisting auth across app restarts

Already configured in §9 (`storage: AsyncStorage` + `persistSession: true`). Add this to `App.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from './src/store/useAuthStore';
import { getSession, onAuthChange } from './src/services/authService';
import { getMyProfile } from './src/services/profileService';

export default function App() {
  const [ready, setReady] = useState(false);
  const { login, logout } = useAuthStore();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        const profile = await getMyProfile();
        login(profile);
      }
      setReady(true);
    })();

    const { data: sub } = onAuthChange(async (session) => {
      if (session) {
        const profile = await getMyProfile();
        login(profile);
      } else {
        logout();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;  // or <Loader />
  return <AppNavigator />;
}
```

---

## 17. Testing checklist

Run through this once you've wired it up:

- [ ] Sign up with a new email → check Supabase **Authentication → Users** has the row
- [ ] Check Supabase **Table editor → profiles** — the trigger should have inserted a row
- [ ] Login → close the app → reopen → still logged in (session persisted)
- [ ] Create a post → row appears in `posts` table
- [ ] Pull to refresh on Home → new post appears in the feed
- [ ] Like a post → `post_likes` row created → `posts.likes_count` incremented
- [ ] Open a post detail → add a comment → `comments` row → `posts.comments_count` incremented
- [ ] Open Explore → nearby users visible (sign up a 2nd user with a close lat/lng to test)
- [ ] Follow another user → `follows` row created
- [ ] Open a chat with that user → send a message → other device receives it instantly (realtime)
- [ ] Edit profile → pick new avatar → image uploaded to `avatars` bucket, URL saved
- [ ] Logout → app returns to Welcome screen

---

## 18. Free tier limits & when to upgrade

Supabase Free plan covers:

| Resource | Free limit | When you'd hit it |
|---|---|---|
| Database | 500 MB | ~250,000 posts with light comments — plenty for MVP |
| Auth users | 50,000 MAU | You're a hit before this matters |
| Storage | 1 GB | ~5,000 images at 200 KB each |
| Realtime | 200 concurrent / 2M msgs / month | Hundreds of active chatters |
| Edge function invocations | 500K / month | More than enough |
| Bandwidth (egress) | 5 GB / month | First constraint you'll likely hit; optimize image sizes |
| Auto-pause | Projects pause after 7 days of inactivity | Just open the dashboard or hit any endpoint to wake |

Upgrading is **$25/month** (Pro plan) and lifts most limits 20×.

**Tips to stay free longer:**
- Compress images before uploading (`quality: 0.7` in `launchImageLibrary`).
- Use thumbnails — store one full and one small image; show small in feed.
- Paginate everything; never `select * limit 1000`.
- Don't subscribe to realtime on screens that aren't visible.

---

## Appendix — Quick reference: every backend call in one table

| # | Operation | Function | SQL / RPC |
|---|---|---|---|
| 1 | Sign up | `signUp(...)` | `supabase.auth.signUp` |
| 2 | Log in | `signIn(...)` | `supabase.auth.signInWithPassword` |
| 3 | Log out | `signOut()` | `supabase.auth.signOut` |
| 4 | Get current session | `getSession()` | `supabase.auth.getSession` |
| 5 | Get my profile | `getMyProfile()` | `select * from profiles where id = auth.uid()` |
| 6 | Get any profile | `getProfile(id)` | `select * from profiles where id = ?` |
| 7 | Update profile | `updateProfile(patch)` | `update profiles set ... where id = auth.uid()` |
| 8 | Profile stats | `getProfileStats(id)` | 3× count queries on posts/follows |
| 9 | Local feed | `getFeed({lat,lng,radius})` | RPC `nearby_posts(...)` |
| 10 | Create post | `createPost({...})` | `insert into posts` |
| 11 | Get single post | `getPost(id)` | `select ... from posts join profiles` |
| 12 | Delete post | `deletePost(id)` | `delete from posts where id = ?` |
| 13 | Like/unlike | `toggleLike(id)` | upsert/delete `post_likes` |
| 14 | Has liked? | `hasLiked(id)` | `select from post_likes` |
| 15 | List comments | `getComments(postId)` | `select ... from comments join profiles` |
| 16 | Add comment | `addComment(...)` | `insert into comments` |
| 17 | Nearby users | `getNearbyUsers({lat,lng})` | RPC `nearby_users(...)` |
| 18 | Search users | `searchUsers(q)` | `select from profiles where name ilike '%q%'` |
| 19 | Follow | `follow(id)` | `insert into follows` |
| 20 | Unfollow | `unfollow(id)` | `delete from follows` |
| 21 | Following? | `isFollowing(id)` | `select from follows` |
| 22 | List my chats | `getChats()` | `select from chats where user_a or user_b = me` |
| 23 | Open / create chat | `openChat(otherId)` | RPC `get_or_create_chat(...)` |
| 24 | Messages | `getMessages(chatId)` | `select from messages where chat_id = ?` |
| 25 | Send message | `sendMessage(chatId, text)` | `insert into messages` |
| 26 | Mark read | `markRead(chatId)` | `update messages set read = true` |
| 27 | Upload avatar | `uploadAvatar(uri)` | `supabase.storage.from('avatars').upload(...)` |
| 28 | Upload post image | `uploadPostImage(uri)` | `supabase.storage.from('posts').upload(...)` |
| 29 | Subscribe to new messages | (channel) | `supabase.channel(...).on('postgres_changes', ...)` |
| 30 | Subscribe to new posts | (channel) | same pattern on `posts` table |

---

## Where to go next

Once the above is working:

1. **Email confirmation + password reset** — enable in Supabase Auth settings.
2. **Push notifications** — §14.
3. **Search & hashtags** — add a `topics` materialized view that buckets `posts.text` by `#tag`.
4. **Block / report** — extra table `blocks (blocker, blocked)`, filter feeds/chats by it.
5. **Analytics** — Supabase has free logs; or plug in PostHog (free tier).
6. **Move secrets out of the bundle** — `react-native-config` + `.env`.

You're done. Build something great. 🟢
