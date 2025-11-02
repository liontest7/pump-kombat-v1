-- Update users table to be wallet-based only (no dependency on auth.users)
-- Drop the existing users table and recreate it without auth dependency

drop table if exists public.users cascade;

-- Create new wallet-based users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text,
  token_balance decimal(20, 8) default 0,
  wins integer default 0,
  losses integer default 0,
  total_games integer default 0,
  ranking_points integer default 1000,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS Policies for users table (allow all operations since we're using wallet-based auth)
create policy "users_select_all"
  on public.users for select
  using (true);

create policy "users_insert_all"
  on public.users for insert
  with check (true);

create policy "users_update_all"
  on public.users for update
  using (true);

-- Create indexes for faster lookups
create index if not exists users_wallet_address_idx on public.users(wallet_address);
create index if not exists users_ranking_points_idx on public.users(ranking_points desc);

-- Create or replace function to get/create user by wallet
create or replace function public.get_or_create_user_by_wallet(
  p_wallet_address text,
  p_username text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Try to find existing user
  select id into v_user_id
  from public.users
  where wallet_address = p_wallet_address;
  
  -- If user doesn't exist, create them
  if v_user_id is null then
    insert into public.users (wallet_address, username)
    values (
      p_wallet_address,
      coalesce(p_username, 'Fighter_' || substring(p_wallet_address from 1 for 8))
    )
    returning id into v_user_id;
  end if;
  
  return v_user_id;
end;
$$;
