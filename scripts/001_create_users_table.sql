-- Updated to wallet-only authentication (removed auth.users dependency)
-- Create wallet-based users table
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

-- Updated RLS policies for wallet-based auth (allow all operations)
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

-- Add comments
comment on table public.users is 'User profiles linked to crypto wallet addresses';
comment on column public.users.wallet_address is 'Solana wallet public key (primary identifier)';
comment on column public.users.ranking_points is 'ELO-style ranking points (starts at 1000)';
