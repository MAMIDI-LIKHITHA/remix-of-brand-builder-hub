-- 1. Fix mutable search_path on trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- 2. Lock down SECURITY DEFINER functions: trigger functions must not be API-callable
revoke all on function public.handle_new_user_role() from anon, authenticated, public;
revoke all on function public.touch_updated_at() from anon, authenticated, public;
revoke all on function public.has_role(uuid, public.app_role) from anon, public;
-- has_role stays callable by signed-in users only (required by RLS policies and admin checks)
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- 3. Unpublished products/services must not be readable by non-admin authenticated users
drop policy if exists "Authenticated read products" on public.products;
drop policy if exists "Public read published products" on public.products;
create policy "Read published or admin products"
on public.products for select
to anon, authenticated
using (is_published or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Authenticated read services" on public.services;
drop policy if exists "Public read published services" on public.services;
create policy "Read published or admin services"
on public.services for select
to anon, authenticated
using (is_published or public.has_role(auth.uid(), 'admin'));

-- 4. Private media bucket: explicit admin-only access control on storage objects
drop policy if exists "Admins manage media objects" on storage.objects;
create policy "Admins manage media objects"
on storage.objects for all
to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
