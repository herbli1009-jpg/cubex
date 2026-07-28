create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), name text not null, company text, email text not null, country text,
  service text not null, priority text not null, details text not null, source text not null check (source in ('contact','questionnaire','product','resource')),
  product text, resource text, questionnaire jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','in_progress','closed','spam')), created_at timestamptz not null default now(), handled_at timestamptz
);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
