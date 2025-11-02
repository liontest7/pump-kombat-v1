-- Create a view for leaderboard
create or replace view public.leaderboard as
select 
  u.id,
  u.username,
  u.wins,
  u.losses,
  u.total_games,
  u.ranking_points,
  case 
    when u.total_games > 0 then round((u.wins::decimal / u.total_games::decimal) * 100, 2)
    else 0
  end as win_rate
from public.users u
order by u.ranking_points desc, u.wins desc
limit 100;
