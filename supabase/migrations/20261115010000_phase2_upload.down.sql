-- =============================================================================
-- ClassLeaf Phase 2: Upload and Job Flow Migration (DOWN)
-- Reverts notes updated_at column and trigger
-- =============================================================================

drop trigger if exists trigger_notes_updated_at on public.notes;
drop function if exists public.update_notes_updated_at();

alter table public.notes
drop column if exists updated_at;
