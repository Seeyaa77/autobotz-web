-- ============================================================
-- AUTOBOTZ DATABASE SCHEMA (IDEMPOTENT & RLS-HARDENED)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to re-run on an existing database without losing data.
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- SHARED HELPER FUNCTIONS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  business_name text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'affiliate')),
  tier text default 'free' check (tier in ('free', 'script', 'hosting', 'rental')),
  current_plan_id uuid,
  subscription_status text check (subscription_status in ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Non-recursive admin role helper (fixes infinite recursion 42P17 in profiles RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- Prevent regular users from escalating role, tier, or subscription fields
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if jwt_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin', 'service_role')
     or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.tier is distinct from old.tier
     or new.current_plan_id is distinct from old.current_plan_id
     or new.subscription_status is distinct from old.subscription_status
     or new.trial_ends_at is distinct from old.trial_ends_at then
    raise exception 'Forbidden: privileged profile fields can only be modified by admin or server';
  end if;

  return new;
end;
$$;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, business_name, full_name, phone, role, tier)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    'user',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_protect_privileged on public.profiles;
create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileged_columns();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 2. PLANS (Product Catalog)
-- ============================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  tier text not null check (tier in ('script', 'hosting', 'rental')),
  name text not null,
  description text,
  price_idr integer not null,
  billing_cycle text not null check (billing_cycle in ('one_time', 'monthly', 'yearly')),
  features jsonb not null default '[]',
  limits jsonb not null default '{}',
  commission_percent numeric(5,2) default 0,
  is_active boolean default true,
  is_popular boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_current_plan_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_current_plan_id_fkey
      foreign key (current_plan_id) references public.plans(id) on delete set null;
  end if;
end;
$$;

alter table public.plans enable row level security;

drop policy if exists "Anyone can view active plans" on public.plans;
create policy "Anyone can view active plans" on public.plans
  for select using (is_active = true);

drop policy if exists "Admins can manage plans" on public.plans;
create policy "Admins can manage plans" on public.plans
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute procedure public.handle_updated_at();

-- Seed canonical UI plans (idempotent)
insert into public.plans (slug, tier, name, description, price_idr, billing_cycle, features, limits, commission_percent, is_active, is_popular, sort_order)
values
  ('starter', 'rental', 'Starter Cloud', 'Cocok untuk seller baru yang ingin coba jualan otomatis tanpa repot kelola server.', 99000, 'monthly',
   '["Hingga 100 transaksi akun / hari", "Bot Cloud Hosting Aktif 24/7", "Integrasi QRIS & Transfer Bank", "Manajemen stok hingga 5 kategori", "Dashboard analytics standar", "Support via Email & Komunitas"]'::jsonb,
   '{"accounts_per_day": 100, "bots": 1, "support_level": "email"}'::jsonb, 0, true, false, 1),

  ('pro', 'rental', 'Professional Cloud', 'Pilihan utama untuk toko akun aktif yang butuh kuota transaksi tinggi dan fitur lengkap.', 299000, 'monthly',
   '["Hingga 1.000 transaksi akun / hari", "Bot Cloud Hosting Dedicated 24/7", "Custom Bot Name & Branding Sendiri", "Unlimited Kategori & Stok Akun", "Notifikasi Otomatis ke Channel Admin", "Export Data Transaksi ke Excel/CSV", "Priority WhatsApp Support 24/7"]'::jsonb,
   '{"accounts_per_day": 1000, "bots": 3, "support_level": "priority"}'::jsonb, 0, true, true, 2),

  ('enterprise', 'rental', 'Enterprise Cloud', 'Untuk agency, suplier besar, atau distributor akun skala masif.', 999000, 'monthly',
   '["Unlimited transaksi akun / hari", "Dedicated Private VPS Cluster", "Multi-Bot Token (Hingga 5 Bot)", "Custom Webhook & API Integration", "SLA 99.99% Uptime Guarantee", "Dedicated Account Manager 1-on-1"]'::jsonb,
   '{"accounts_per_day": -1, "bots": 5, "support_level": "dedicated"}'::jsonb, 0, true, false, 3),

  ('script', 'script', 'Full Source Code (Script Only)', 'Full source code bot Telegram lengkap, 100% open source tanpa enkripsi untuk developer & pemilik server.', 300000, 'one_time',
   '["Full Source Code Node.js / Telegraf (100% Unencrypted)", "Database Schema SQL (Supabase / PostgreSQL)", "Frontend & Dashboard Template Web React", "Panduan Setup Lengkap & Tutorial Deploy", "Lisensi Komersial Seumur Hidup (Boleh White-Label)", "Free Update Bug Fixes & Patch Versi Minor"]'::jsonb,
   '{}'::jsonb, 0, true, false, 4)
on conflict (slug) do nothing;

-- Deactivate legacy slugs (preserves existing FKs without duplicating active pricing cards)
update public.plans
set is_active = false
where slug in (
  'script-tier1',
  'hosting-starter',
  'hosting-pro',
  'hosting-enterprise',
  'rental-starter',
  'rental-pro',
  'rental-enterprise'
);

-- ============================================================
-- 3. ORDERS (Purchases & Subscriptions)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  amount_idr integer not null,
  billing_cycle text not null check (billing_cycle in ('one_time', 'monthly', 'yearly')),
  payment_method text,
  payment_reference text,
  payment_proof_url text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'expired', 'pending_verification')),
  paid_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders add column if not exists verified_by uuid references public.profiles(id) on delete set null;
alter table public.orders add column if not exists verified_at timestamptz;
alter table public.orders add column if not exists rejection_reason text;

alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Restrict direct client inserts so users cannot forge paid orders (production checkout uses backend API)
drop policy if exists "Users can create orders" on public.orders;
create policy "Users can create orders" on public.orders
  for insert
  with check (
    auth.uid() = user_id
    and payment_status = 'pending'
    and paid_at is null
    and verified_by is null
    and verified_at is null
  );

drop policy if exists "Admins can manage all orders" on public.orders;
create policy "Admins can manage all orders" on public.orders
  for all
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_subscription_id on public.orders(subscription_id);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 4. BOT INSTANCES (Managed Bots)
-- ============================================================
create table if not exists public.bot_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  bot_name text not null,
  bot_username text unique,
  bot_token_encrypted text,
  webhook_url text,
  deployment_type text not null check (deployment_type in ('vps_container', 'saas_shared')),
  container_id text,
  vps_ip text,
  status text default 'provisioning' check (status in ('provisioning', 'running', 'stopped', 'error', 'suspended')),
  max_accounts_per_day integer,
  max_concurrent_chats integer,
  custom_welcome_message text,
  custom_branding jsonb,
  deployed_at timestamptz,
  last_heartbeat timestamptz,
  suspended_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bot_instances enable row level security;

drop policy if exists "Users can view own bots" on public.bot_instances;
create policy "Users can view own bots" on public.bot_instances
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own bots" on public.bot_instances;
create policy "Users can update own bots" on public.bot_instances
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can manage all bots" on public.bot_instances;
create policy "Admins can manage all bots" on public.bot_instances
  for all
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_bot_instances_user_id on public.bot_instances(user_id);
create index if not exists idx_bot_instances_status on public.bot_instances(status);
create index if not exists idx_bot_instances_bot_username on public.bot_instances(bot_username);

drop trigger if exists bot_instances_updated_at on public.bot_instances;
create trigger bot_instances_updated_at
  before update on public.bot_instances
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 5. ACCOUNT CATEGORIES
-- ============================================================
create table if not exists public.account_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text,
  description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.account_categories enable row level security;

drop policy if exists "Anyone can view active categories" on public.account_categories;
create policy "Anyone can view active categories" on public.account_categories
  for select using (is_active = true);

drop policy if exists "Admins can manage categories" on public.account_categories;
create policy "Admins can manage categories" on public.account_categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.account_categories (name, slug, icon, sort_order)
values
  ('Instagram', 'instagram', '📸', 1),
  ('TikTok', 'tiktok', '🎵', 2),
  ('Telegram', 'telegram', '💬', 3),
  ('Mobile Legends', 'mobile-legends', '🎮', 4),
  ('Genshin Impact', 'genshin-impact', '⚔️', 5),
  ('Free Fire', 'free-fire', '🔥', 6),
  ('Valorant', 'valorant', '🎯', 7),
  ('Lainnya', 'others', '📦', 99)
on conflict (slug) do nothing;

-- ============================================================
-- 6. ACCOUNTS (Inventory)
-- ============================================================
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bot_instance_id uuid references public.bot_instances(id) on delete set null,
  category_id uuid not null references public.account_categories(id),
  title text not null,
  description text,
  username text,
  credentials_encrypted text not null,
  extra_data jsonb default '{}',
  price_idr integer not null,
  status text default 'draft' check (status in ('draft', 'listed', 'sold', 'delivered', 'disputed', 'removed')),
  delivery_type text default 'auto' check (delivery_type in ('auto', 'manual')),
  delivery_message text,
  sold_at timestamptz,
  buyer_telegram_id bigint,
  transaction_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  listed_at timestamptz
);

alter table public.accounts enable row level security;

drop policy if exists "Users can manage own accounts" on public.accounts;
create policy "Users can manage own accounts" on public.accounts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view all accounts" on public.accounts;
create policy "Admins can view all accounts" on public.accounts
  for select using (public.is_admin());

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_accounts_bot_instance_id on public.accounts(bot_instance_id);
create index if not exists idx_accounts_category_id on public.accounts(category_id);
create index if not exists idx_accounts_status on public.accounts(status);

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at
  before update on public.accounts
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 7. TRANSACTIONS (Sales & Commission)
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bot_instance_id uuid not null references public.bot_instances(id),
  account_id uuid not null references public.accounts(id) on delete cascade,
  buyer_telegram_id bigint not null,
  buyer_username text,
  gross_amount_idr integer not null,
  platform_fee_idr integer not null,
  autobotz_commission_idr integer not null,
  net_amount_idr integer not null,
  commission_percent numeric(5,2) not null,
  payment_gateway text,
  payment_reference text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'chargeback')),
  paid_at timestamptz,
  settlement_status text default 'pending' check (settlement_status in ('pending', 'processing', 'paid', 'held')),
  settlement_batch_id uuid,
  settled_at timestamptz,
  delivery_status text default 'pending' check (delivery_status in ('pending', 'delivered', 'failed', 'disputed')),
  delivered_at timestamptz,
  delivery_proof jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can manage all transactions" on public.transactions;
create policy "Admins can manage all transactions" on public.transactions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_bot_instance_id on public.transactions(bot_instance_id);
create index if not exists idx_transactions_payment_status on public.transactions(payment_status);
create index if not exists idx_transactions_settlement_status on public.transactions(settlement_status);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- Settlement Batches (Weekly payouts)
create table if not exists public.settlement_batches (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  status text default 'calculating' check (status in ('calculating', 'ready', 'processing', 'completed', 'failed')),
  total_gross_idr bigint default 0,
  total_commission_idr bigint default 0,
  total_platform_fee_idr bigint default 0,
  total_net_idr bigint default 0,
  transaction_count integer default 0,
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.settlement_batches enable row level security;

drop policy if exists "Admins can manage settlement batches" on public.settlement_batches;
create policy "Admins can manage settlement batches" on public.settlement_batches
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 8. ANALYTICS EVENTS
-- ============================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  bot_instance_id uuid references public.bot_instances(id) on delete cascade,
  event_type text not null,
  event_name text not null,
  properties jsonb default '{}',
  tier text check (tier in ('script', 'hosting', 'rental')),
  plan_slug text,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

drop policy if exists "Users can view own analytics" on public.analytics_events;
create policy "Users can view own analytics" on public.analytics_events
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all analytics" on public.analytics_events;
create policy "Admins can view all analytics" on public.analytics_events
  for select using (public.is_admin());

drop policy if exists "System can insert analytics" on public.analytics_events;
drop policy if exists "Users can insert own analytics" on public.analytics_events;
create policy "Users can insert own analytics" on public.analytics_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create index if not exists idx_analytics_user_created on public.analytics_events(user_id, created_at desc);
create index if not exists idx_analytics_bot_created on public.analytics_events(bot_instance_id, created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events(event_type);

-- ============================================================
-- 9. AFFILIATE SYSTEM
-- ============================================================
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  referral_code text unique not null,
  commission_tier1 numeric(5,2) default 15.00,
  commission_tier2_first_month numeric(5,2) default 20.00,
  commission_tier2_recurring numeric(5,2) default 5.00,
  commission_tier3_lifetime numeric(5,2) default 10.00,
  total_earnings_idr bigint default 0,
  pending_earnings_idr bigint default 0,
  paid_earnings_idr bigint default 0,
  status text default 'active' check (status in ('active', 'paused', 'banned')),
  created_at timestamptz default now()
);

alter table public.affiliates enable row level security;

drop policy if exists "Users can view own affiliate" on public.affiliates;
create policy "Users can view own affiliate" on public.affiliates
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can manage affiliates" on public.affiliates;
create policy "Admins can manage affiliates" on public.affiliates
  for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  tier text not null check (tier in ('script', 'hosting', 'rental')),
  commission_amount_idr integer not null,
  commission_status text default 'pending' check (commission_status in ('pending', 'approved', 'paid', 'cancelled')),
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.affiliate_referrals enable row level security;

drop policy if exists "Affiliates can view own referrals" on public.affiliate_referrals;
create policy "Affiliates can view own referrals" on public.affiliate_referrals
  for select using (
    exists (select 1 from public.affiliates where id = affiliate_id and user_id = auth.uid())
  );

drop policy if exists "Admins can view all referrals" on public.affiliate_referrals;
create policy "Admins can view all referrals" on public.affiliate_referrals
  for select using (public.is_admin());

-- ============================================================
-- 10. USER SETTINGS
-- ============================================================
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean default true,
  telegram_notifications boolean default true,
  sale_notifications boolean default true,
  payout_notifications boolean default true,
  marketing_emails boolean default false,
  timezone text default 'Asia/Jakarta',
  language text default 'id',
  currency text default 'IDR',
  two_factor_enabled boolean default false,
  two_factor_secret text,
  api_key_encrypted text,
  api_key_last_used timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users can manage own settings" on public.user_settings;
create policy "Users can manage own settings" on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view all settings" on public.user_settings;
create policy "Admins can view all settings" on public.user_settings
  for select using (public.is_admin());

drop trigger if exists user_settings_updated_at on public.user_settings;
create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  data jsonb default '{}',
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role bypasses RLS automatically; prevent regular users from forging notifications
drop policy if exists "System can insert notifications" on public.notifications;
drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications" on public.notifications
  for insert
  to authenticated
  with check (public.is_admin());

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, is_read) where is_read = false;

-- ============================================================
-- 12. VIEWS FOR DASHBOARD (security_invoker = true so RLS applies!)
-- ============================================================

create or replace view public.user_dashboard_summary
with (security_invoker = true) as
select
  p.id as user_id,
  p.business_name,
  p.tier,
  p.subscription_status,
  pl.name as plan_name,
  pl.tier as plan_tier,
  pl.price_idr as plan_price,
  pl.billing_cycle as plan_billing_cycle,
  bi.id as bot_instance_id,
  bi.bot_name,
  bi.bot_username,
  bi.status as bot_status,
  bi.deployed_at,
  bi.max_accounts_per_day,
  (select count(*) from public.accounts where user_id = p.id and status = 'listed') as active_listings,
  (select count(*) from public.accounts where user_id = p.id and status = 'sold') as total_sold,
  (select coalesce(sum(price_idr), 0) from public.accounts where user_id = p.id and status = 'sold') as total_revenue,
  (select count(*) from public.transactions where user_id = p.id and payment_status = 'paid') as completed_transactions,
  (select coalesce(sum(net_amount_idr), 0) from public.transactions where user_id = p.id and settlement_status = 'paid') as total_payout,
  (select coalesce(sum(net_amount_idr), 0) from public.transactions where user_id = p.id and settlement_status = 'pending') as pending_payout
from public.profiles p
left join public.plans pl on p.current_plan_id = pl.id
left join public.bot_instances bi on bi.user_id = p.id and bi.status = 'running';

grant select on public.user_dashboard_summary to authenticated;

create or replace view public.monthly_revenue_report
with (security_invoker = true) as
select
  date_trunc('month', o.created_at) as month,
  count(*) filter (where o.payment_status = 'paid') as paid_orders,
  sum(o.amount_idr) filter (where o.payment_status = 'paid') as gross_revenue,
  count(*) filter (where pl.tier = 'script' and o.payment_status = 'paid') as script_sales,
  count(*) filter (where pl.tier = 'hosting' and o.payment_status = 'paid') as hosting_subscriptions,
  count(*) filter (where pl.tier = 'rental' and o.payment_status = 'paid') as rental_subscriptions
from public.orders o
join public.plans pl on o.plan_id = pl.id
where public.is_admin()
group by date_trunc('month', o.created_at)
order by month desc;

grant select on public.monthly_revenue_report to authenticated;

create or replace view public.user_commission_summary
with (security_invoker = true) as
select
  t.user_id,
  date_trunc('week', t.created_at) as week,
  count(*) as transactions_count,
  sum(t.gross_amount_idr) as total_gmv,
  sum(t.autobotz_commission_idr) as total_commission,
  sum(t.net_amount_idr) as total_seller_earnings,
  sum(t.net_amount_idr) filter (where t.settlement_status = 'paid') as paid_out,
  sum(t.net_amount_idr) filter (where t.settlement_status = 'pending') as pending_payout
from public.transactions t
where t.payment_status = 'paid'
group by t.user_id, date_trunc('week', t.created_at);

grant select on public.user_commission_summary to authenticated;
