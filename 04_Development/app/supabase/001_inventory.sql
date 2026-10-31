-- One atomic inventory document per account. No anonymous access.
begin;
create table public.inventory_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  fridge_state jsonb not null check (jsonb_typeof(fridge_state) = 'object'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.inventory_snapshots enable row level security;
revoke all on public.inventory_snapshots from anon, authenticated;
grant select, insert, update on public.inventory_snapshots to authenticated;
create policy "Read own inventory" on public.inventory_snapshots
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own inventory" on public.inventory_snapshots
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own inventory" on public.inventory_snapshots
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
commit;
