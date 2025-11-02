-- Ensure all required database functions exist
-- This script re-creates all necessary functions to fix any missing function errors

-- Function to get or create user by wallet address
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

-- Function to increment user wins
create or replace function public.increment_user_wins(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set 
    wins = wins + 1,
    total_games = total_games + 1,
    ranking_points = ranking_points + 25
  where id = user_id;
end;
$$;

-- Function to increment user losses
create or replace function public.increment_user_losses(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set 
    losses = losses + 1,
    total_games = total_games + 1,
    ranking_points = greatest(ranking_points - 15, 0)
  where id = user_id;
end;
$$;

-- Add comments
comment on function public.get_or_create_user_by_wallet is 'Gets existing user or creates new one by wallet address';
comment on function public.increment_user_wins is 'Increments user win count and updates stats';
comment on function public.increment_user_losses is 'Increments user loss count and updates stats';
