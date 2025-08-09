
-- Create will_drafts table for anonymous, unlisted draft sharing
create extension if not exists pgcrypto;

create table if not exists public.will_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  data jsonb not null,
  tone text,
  step integer,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.will_drafts enable row level security;

-- Policy: anyone can read drafts (unlisted-by-slug)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'will_drafts' and policyname = 'Anyone can read drafts'
  ) then
    create policy "Anyone can read drafts" on public.will_drafts
      for select using (true);
  end if;
end $$;

-- Policy: anyone can insert new drafts
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'will_drafts' and policyname = 'Anyone can insert drafts'
  ) then
    create policy "Anyone can insert drafts" on public.will_drafts
      for insert with check (true);
  end if;
end $$;

-- Helpful index for fast lookups by slug (redundant with unique, but explicit)
create index if not exists idx_will_drafts_slug on public.will_drafts (slug);
