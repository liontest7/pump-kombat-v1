-- Complete Database Setup for Pump Kombat
-- Run this script in your Supabase SQL Editor to set up all tables and policies

-- ============================================
-- 1. USERS TABLE
-- ============================================

-- Drop existing table if you want to start fresh (CAUTION: This deletes all data!)
-- drop table if exists public.users cascade;

create table if not exists public.users (
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

-- Drop existing policies if they exist
drop policy if exists "users_select_all" on public.users;
drop policy if exists "users_insert_all" on public.users;
drop policy if exists "users_update_all" on public.users;

-- RLS policies for users (allow all operations)
create policy "users_select_all"
  on public.users for select
  using (true);

create policy "users_insert_all"
  on public.users for insert
  with check (true);

create policy "users_update_all"
  on public.users for update
  using (true);

-- Create indexes
create index if not exists users_wallet_address_idx on public.users(wallet_address);
create index if not exists users_ranking_points_idx on public.users(ranking_points desc);

-- ============================================
-- 2. GAME ROOMS TABLE
-- ============================================

-- Drop existing table if you want to start fresh (CAUTION: This deletes all data!)
-- drop table if exists public.game_rooms cascade;

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  host_id uuid references public.users(id) on delete cascade,
  opponent_id uuid references public.users(id) on delete set null,
  host_fighter text,
  opponent_fighter text,
  bet_amount decimal(20, 8) default 0,
  status text not null default 'waiting',
  winner_id uuid references public.users(id) on delete set null,
  host_health integer,
  opponent_health integer,
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  constraint valid_status check (status in ('waiting', 'in_progress', 'completed', 'cancelled'))
);

-- Enable RLS
alter table public.game_rooms enable row level security;

-- Drop existing policies if they exist
drop policy if exists "game_rooms_select_all" on public.game_rooms;
drop policy if exists "game_rooms_insert_all" on public.game_rooms;
drop policy if exists "game_rooms_update_all" on public.game_rooms;

-- RLS Policies for game_rooms
create policy "game_rooms_select_all"
  on public.game_rooms for select
  using (true);

create policy "game_rooms_insert_all"
  on public.game_rooms for insert
  with check (true);

create policy "game_rooms_update_all"
  on public.game_rooms for update
  using (true);

-- Create indexes
create index if not exists game_rooms_status_idx on public.game_rooms(status);
create index if not exists game_rooms_room_code_idx on public.game_rooms(room_code);
create index if not exists game_rooms_host_id_idx on public.game_rooms(host_id);
create index if not exists game_rooms_created_at_idx on public.game_rooms(created_at desc);

-- ============================================
-- 3. GAME RESULTS TABLE
-- ============================================

-- Drop existing table if you want to start fresh (CAUTION: This deletes all data!)
-- drop table if exists public.game_results cascade;

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.game_rooms(id) on delete cascade,
  winner_id uuid references public.users(id) on delete set null,
  loser_id uuid references public.users(id) on delete set null,
  winner_fighter text,
  loser_fighter text,
  bet_amount decimal(20, 8) default 0,
  winner_payout decimal(20, 8) default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.game_results enable row level security;

-- Drop existing policies if they exist
drop policy if exists "game_results_select_all" on public.game_results;
drop policy if exists "game_results_insert_all" on public.game_results;

-- RLS Policies
create policy "game_results_select_all"
  on public.game_results for select
  using (true);

create policy "game_results_insert_all"
  on public.game_results for insert
  with check (true);

-- Create indexes
create index if not exists game_results_winner_id_idx on public.game_results(winner_id);
create index if not exists game_results_loser_id_idx on public.game_results(loser_id);
create index if not exists game_results_created_at_idx on public.game_results(created_at desc);
create index if not exists game_results_room_id_idx on public.game_results(room_id);

-- ============================================
-- 4. LEADERBOARD VIEW
-- ============================================

-- Drop existing view if it exists
drop view if exists public.leaderboard;

create or replace view public.leaderboard as
select 
  id,
  username,
  wallet_address,
  wins,
  losses,
  total_games,
  ranking_points,
  token_balance,
  case 
    when total_games > 0 then round((wins::decimal / total_games::decimal) * 100, 2)
    else 0
  end as win_rate
from public.users
order by ranking_points desc, wins desc;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify everything is set up correctly:

-- Check if tables exist
-- select table_name from information_schema.tables where table_schema = 'public' and table_name in ('users', 'game_rooms', 'game_results');

-- Check if RLS is enabled
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ('users', 'game_rooms', 'game_results');

-- Check policies
-- select tablename, policyname from pg_policies where schemaname = 'public';

-- Test insert (should work)
-- insert into public.users (wallet_address, username) values ('TEST_WALLET_123', 'TestPlayer') returning *;

-- Clean up test data
-- delete from public.users where wallet_address = 'TEST_WALLET_123';
