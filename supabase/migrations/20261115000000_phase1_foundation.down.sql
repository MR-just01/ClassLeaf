-- =============================================================================
-- ClassLeaf Phase 1: Foundation Migration (DOWN)
-- Reverts all tables, triggers, functions, policies, and storage bucket created in UP
-- =============================================================================

-- 1. Storage Cleanup
drop policy if exists "storage_owner_select" on storage.objects;
drop policy if exists "storage_owner_delete" on storage.objects;
drop policy if exists "storage_owner_update" on storage.objects;
drop policy if exists "storage_owner_upload" on storage.objects;
delete from storage.buckets where id = 'note-images';

-- 2. Drop Tables and Dependencies (in reverse dependency order)
drop table if exists public.jobs cascade;
drop table if exists public.images cascade;
drop table if exists public.notes cascade;
drop table if exists public.notebooks cascade;

-- 3. Drop Security Definer Helper Functions
drop function if exists public.is_note_owner(uuid);
drop function if exists public.is_notebook_owner(uuid);

-- 4. Drop Triggers and Functions on Profiles & Auth
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop trigger if exists trigger_check_username_immutability on public.profiles;
drop function if exists public.check_username_immutability();

drop table if exists public.profiles cascade;
