-- =============================================================================
-- ClassLeaf Phase 2: Upload and Job Flow Migration (UP)
-- Adds updated_at timestamp and trigger for notes
-- =============================================================================

alter table public.notes
add column if not exists updated_at timestamptz default now() not null;

create or replace function public.update_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_notes_updated_at on public.notes;
create trigger trigger_notes_updated_at
before update on public.notes
for each row
execute function public.update_notes_updated_at();
