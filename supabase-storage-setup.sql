-- ============================================================
-- AUTOBOTZ STORAGE SETUP FOR PAYMENT PROOFS (IDEMPOTENT)
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- Safe to re-run without duplicating policies or losing objects.
-- ============================================================

-- Ensure non-recursive admin helper exists even if run standalone
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

-- 1. Create or harden private storage bucket (served via signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false, -- private bucket: accessed via short-lived signed URLs
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Policy: Users can upload their own payment proofs under <auth.uid()>/
drop policy if exists "Users can upload own payment proofs" on storage.objects;
create policy "Users can upload own payment proofs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Policy: Users can view their own payment proofs
drop policy if exists "Users can view own payment proofs" on storage.objects;
create policy "Users can view own payment proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Policy: Admins can view all payment proofs (non-recursive)
drop policy if exists "Admins can view all payment proofs" on storage.objects;
create policy "Admins can view all payment proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.is_admin()
);

-- 5. Policy: Users can update their own payment proofs
drop policy if exists "Users can update own payment proofs" on storage.objects;
create policy "Users can update own payment proofs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy: Users can delete their own payment proofs
drop policy if exists "Users can delete own payment proofs" on storage.objects;
create policy "Users can delete own payment proofs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify bucket and policies
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'payment-proofs';

select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%payment%';
