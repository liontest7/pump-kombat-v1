-- Create leaderboard view for rankings
create or replace view public.leaderboard as
select 
  id,
  wallet_address,
  username,
  wins,
  losses,
  total_games,
  ranking_points,
  case 
    when total_games > 0 then round((wins::decimal / total_games::decimal) * 100, 2)
    else 0
  end as win_rate
from public.users
where total_games > 0
order by ranking_points desc, wins desc
limit 100;

-- Add comment
comment on view public.leaderboard is 'Top 100 players ranked by points and wins';
