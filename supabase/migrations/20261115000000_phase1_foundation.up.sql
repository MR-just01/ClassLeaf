-- =============================================================================
-- ClassLeaf Phase 1: Foundation Migration (UP)
-- Schema: profiles, notebooks, notes, images, jobs + RLS + Storage
-- =============================================================================

-- 1. Profiles Table
-- Holds public user profiles with globally unique, permanent usernames.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now() not null,
  constraint username_lowercase check (username = lower(username)),
  constraint username_length check (char_length(username) between 3 and 20),
  constraint username_format check (username ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint username_reserved check (
    username not in (
      'admin', 'administrator', 'api', 'login', 'signup', 'signin', 'signout',
      'logout', 'settings', 'about', 'dashboard', 'new', 'app', 'auth',
      '_next', 'help', 'support', 'terms', 'privacy', 'legal', 'static',
      'public', 'favicon', 'classleaf'
    )
  )
);

-- Trigger: Enforce username immutability after creation
create or replace function public.check_username_immutability()
returns trigger as $$
begin
  if new.username <> old.username then
    raise exception 'Username is permanent and cannot be modified';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_check_username_immutability on public.profiles;
create trigger trigger_check_username_immutability
before update on public.profiles
for each row
execute function public.check_username_immutability();

-- Trigger: Automatically insert profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
begin
  raw_username := lower(trim(new.raw_user_meta_data->>'username'));
  if raw_username is not null and raw_username <> '' then
    insert into public.profiles (id, username, created_at)
    values (new.id, raw_username, now())
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 2. Notebooks Table
-- Represents shared class notebooks owned by an owner student.
create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null,
  constraint notebooks_owner_id_slug_key unique (owner_id, slug),
  constraint slug_lowercase check (slug = lower(slug)),
  constraint slug_length check (char_length(slug) between 2 and 60),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- 3. Notes Table
-- Markdown notes belonging to a notebook, with AI uncertainty flags and publication state.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  title text not null,
  content text not null default '',
  flags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now() not null,
  published_at timestamptz
);

-- 4. Images Table
-- Metadata for uploaded handwriting photos.
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.notes(id) on delete cascade,
  storage_path text not null,
  order_index integer not null default 0,
  quality_status text not null default 'passed' check (quality_status in ('passed', 'flagged', 'rejected')),
  created_at timestamptz default now() not null
);

-- 5. Jobs Table
-- Async processing job tracking for the five-stage AI pipeline.
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'draft_ready', 'failed')),
  stage text,
  error text,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. Indexes for Performance
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_notebooks_owner_id on public.notebooks(owner_id);
create index if not exists idx_notebooks_owner_slug on public.notebooks(owner_id, slug);
create index if not exists idx_notes_notebook_id on public.notes(notebook_id);
create index if not exists idx_notes_status on public.notes(status);
create index if not exists idx_images_note_id on public.images(note_id);
create index if not exists idx_jobs_notebook_id on public.jobs(notebook_id);
create index if not exists idx_jobs_status on public.jobs(status);

-- 7. Row Level Security (RLS) Configuration

alter table public.profiles enable row level security;
alter table public.notebooks enable row level security;
alter table public.notes enable row level security;
alter table public.images enable row level security;
alter table public.jobs enable row level security;

-- Profiles RLS:
-- Readable by anyone for username; updatable only by the owner
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Notebooks RLS:
-- Fully accessible to the owner; readable by anyone only if the notebook has at least one published note
create policy "notebooks_owner_all"
  on public.notebooks for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "notebooks_select_public_published"
  on public.notebooks for select
  using (
    exists (
      select 1 from public.notes
      where notes.notebook_id = notebooks.id
        and notes.status = 'published'
    )
  );

-- Notes RLS:
-- Fully accessible to the notebook owner; readable by anyone only when status is published
create policy "notes_owner_all"
  on public.notes for all
  using (
    exists (
      select 1 from public.notebooks
      where notebooks.id = notes.notebook_id
        and notebooks.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.notebooks
      where notebooks.id = notes.notebook_id
        and notebooks.owner_id = auth.uid()
    )
  );

create policy "notes_select_public_published"
  on public.notes for select
  using (status = 'published');

-- Images RLS:
-- Fully accessible to the owner; readable by anyone only for images of published notes
create policy "images_owner_all"
  on public.images for all
  using (
    exists (
      select 1 from public.notes
      join public.notebooks on notebooks.id = notes.notebook_id
      where notes.id = images.note_id
        and notebooks.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.notes
      join public.notebooks on notebooks.id = notes.notebook_id
      where notes.id = images.note_id
        and notebooks.owner_id = auth.uid()
    )
  );

create policy "images_select_public_published"
  on public.images for select
  using (
    exists (
      select 1 from public.notes
      where notes.id = images.note_id
        and notes.status = 'published'
    )
  );

-- Jobs RLS:
-- Owner only: full access to jobs in their notebooks
create policy "jobs_owner_all"
  on public.jobs for all
  using (
    exists (
      select 1 from public.notebooks
      where notebooks.id = jobs.notebook_id
        and notebooks.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.notebooks
      where notebooks.id = jobs.notebook_id
        and notebooks.owner_id = auth.uid()
    )
  );

-- 8. Storage Configuration (Private bucket for note images)
-- Bucket creation
insert into storage.buckets (id, name, public)
values ('note-images', 'note-images', false)
on conflict (id) do nothing;

-- Storage Policies:
-- Owners can upload, update, and delete ONLY inside a folder named with their own user id.
-- Readers never get direct bucket access.
create policy "storage_owner_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'note-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'note-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'note-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'note-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
