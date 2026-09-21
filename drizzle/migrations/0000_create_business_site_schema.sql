-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- First signed-up user becomes admin, everyone else 'user'
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- updated_at helper ---------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- CATEGORIES ----------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

-- PRODUCTS ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  main_image text,
  images text[] not null default '{}',
  short_description text,
  full_description text,
  price numeric(12,2),
  currency text not null default 'QAR',
  availability text not null default 'available',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public read published products" on public.products for select to anon using (is_published);
create policy "Authenticated read products" on public.products for select to authenticated using (true);
create policy "Admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- SERVICES ------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  short_description text,
  full_description text,
  price numeric(12,2),
  currency text not null default 'QAR',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Public read published services" on public.services for select to anon using (is_published);
create policy "Authenticated read services" on public.services for select to authenticated using (true);
create policy "Admins manage services" on public.services for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();

-- GALLERY -------------------------------------------------------------
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.gallery_images to anon;
grant select, insert, update, delete on public.gallery_images to authenticated;
grant all on public.gallery_images to service_role;
alter table public.gallery_images enable row level security;
create policy "Public read gallery" on public.gallery_images for select to anon, authenticated using (true);
create policy "Admins manage gallery" on public.gallery_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger gallery_touch before update on public.gallery_images
  for each row execute function public.touch_updated_at();

-- SITE SETTINGS (single row) -----------------------------------------
create table public.site_settings (
  id text primary key default 'main',
  business_name text not null default 'Aaron Sau',
  tagline text,
  logo_url text,
  hero_heading text,
  hero_subheading text,
  hero_image text,
  hero_primary_cta text,
  hero_secondary_cta text,
  about_heading text,
  about_body text,
  about_image text,
  strengths jsonb not null default '[]'::jsonb,
  cta_heading text,
  cta_body text,
  whatsapp_number text,
  phone text,
  email text,
  address text,
  business_hours text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  snapchat_url text,
  footer_text text,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 'main')
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert settings" on public.site_settings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

insert into public.site_settings (
  id, business_name, tagline, hero_heading, hero_subheading,
  hero_primary_cta, hero_secondary_cta,
  about_heading, about_body, cta_heading, cta_body,
  instagram_url, address, footer_text
) values (
  'main',
  'Aaron Sau',
  'Available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲',
  'Aaron Sau',
  'Aaron Sau',
  'View Products',
  'Our Services',
  'About us',
  'Add your business introduction here from the admin panel.',
  'Get in touch',
  'Message us on WhatsApp and we will get back to you.',
  'https://www.instagram.com/aroon10153/?hl=en',
  'Qatar · Dubai',
  'fts88994 — Qatar · Dubai'
);
