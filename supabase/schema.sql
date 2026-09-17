-- Jalankan ini di Supabase Dashboard -> SQL Editor -> New query

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null default 'Board baru',
  elements jsonb not null default '[]',
  is_premium_export boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keamanan: pastikan user cuma bisa lihat & ubah board miliknya sendiri
alter table boards enable row level security;

create policy "User bisa lihat board sendiri"
  on boards for select
  using (auth.uid() = user_id);

create policy "User bisa bikin board sendiri"
  on boards for insert
  with check (auth.uid() = user_id);

create policy "User bisa ubah board sendiri"
  on boards for update
  using (auth.uid() = user_id);

create policy "User bisa hapus board sendiri"
  on boards for delete
  using (auth.uid() = user_id);
