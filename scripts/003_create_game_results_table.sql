-- Create game results table for match history
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.game_rooms(id) on delete cascade,
  winner_id uuid references public.users(id) on delete set null,
  loser_id uuid references public.users(id) on delete set null,
  winner_fighter text not null,
  loser_fighter text not null,
  bet_amount decimal(20, 8) default 0,
  winner_payout decimal(20, 8) default 0,
  duration_seconds integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.game_results enable row level security;

-- Updated RLS policies for wallet-based auth
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

-- Add comments
comment on table public.game_results is 'Historical record of all completed matches';
comment on column public.game_results.winner_payout is 'Amount won by the winner (after platform fee)';
