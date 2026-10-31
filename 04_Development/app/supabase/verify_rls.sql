-- Isolated assertions. Test users and rows are rolled back, never committed.
begin;
insert into auth.users (id) values ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
insert into public.inventory_snapshots (user_id, items, fridge_state)
values (auth.uid(), '[]', '{"fridges":[{"id":"main-fridge","name":"Main fridge"}],"selectedId":"main-fridge"}');
do $$ begin
  if (select count(*) from public.inventory_snapshots) <> 1 then raise exception 'Owner read failed'; end if;
  update public.inventory_snapshots set revision = 2 where user_id = auth.uid() and revision = 1;
  if not found then raise exception 'Owner update failed'; end if;
  update public.inventory_snapshots set revision = 3 where user_id = auth.uid() and revision = 1;
  if found then raise exception 'Stale revision allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ begin
  if (select count(*) from public.inventory_snapshots) <> 0 then raise exception 'Cross account read leak'; end if;
  update public.inventory_snapshots set revision = 99 where user_id = '10000000-0000-4000-8000-000000000001';
  if found then raise exception 'Cross account update allowed'; end if;
  begin
    insert into public.inventory_snapshots(user_id, fridge_state) values ('10000000-0000-4000-8000-000000000001', '{}');
    raise exception 'Cross account insert allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
set local role anon;
do $$ begin
  begin
    perform * from public.inventory_snapshots;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
select 'PASS: owner read/write, account isolation, anonymous denial, stale revision protection. Test data rolled back.' as result;
