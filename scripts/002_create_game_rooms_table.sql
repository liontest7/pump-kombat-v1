-- Create game rooms table for multiplayer matches
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
  -- Added room_name and map columns for enhanced room features
  room_name text,
  map text,
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  constraint valid_status check (status in ('waiting', 'in_progress', 'completed', 'cancelled'))
);

-- Enable RLS
alter table public.game_rooms enable row level security;

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

-- Add comments
comment on table public.game_rooms is 'Multiplayer game rooms for PvP matches';
comment on column public.game_rooms.host_fighter is 'Fighter selected by host (null until both players join)';
comment on column public.game_rooms.opponent_fighter is 'Fighter selected by opponent (null until both players join)';
comment on column public.game_rooms.status is 'Room status: waiting (for opponent), in_progress (fighting), completed, cancelled';
comment on column public.game_rooms.room_name is 'Optional custom name for the room';
comment on column public.game_rooms.map is 'Selected battle arena/map for the match';
