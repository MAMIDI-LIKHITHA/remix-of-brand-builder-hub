-- Ensure the designated Aaron Sau owner account has admin access.
-- This does not store or change the user's password.
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = 'aaronsau@gmail.com'
on conflict (user_id, role) do nothing;

-- Keep the owner admin if the account is created after this migration.
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = 'aaronsau@gmail.com'
     or not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  else
    insert into public.user_roles (user_id, role)
    values (new.id, 'user')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user_role() from anon, authenticated, public;