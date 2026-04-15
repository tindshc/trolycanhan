create table if not exists public.bot_sessions (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.nhansu (
  id bigint generated always as identity primary key,
  full_name text not null,
  date_of_birth date,
  department text,
  education_level text,
  specialization text,
  professional_title text,
  professional_code text,
  gender text,
  role text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.count_personnel_by_gender()
returns jsonb
language sql
as $$
  select coalesce(
    jsonb_object_agg(gender_key, total_count),
    '{}'::jsonb
  )
  from (
    select
      coalesce(nullif(trim(gender), ''), 'Chưa rõ') as gender_key,
      count(*) as total_count
    from public.nhansu
    group by 1
  ) grouped;
$$;
