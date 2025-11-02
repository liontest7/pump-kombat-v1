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
