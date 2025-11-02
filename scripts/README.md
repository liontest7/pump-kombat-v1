# Database Setup Scripts

These SQL scripts set up the complete database schema for Pump Kombat.

## Execution Order

Run these scripts in order in your Supabase SQL Editor:

1. **001_create_users_table.sql** - Creates the wallet-based users table
2. **002_create_game_rooms_table.sql** - Creates the game rooms table for multiplayer
3. **003_create_game_results_table.sql** - Creates the game results history table
4. **004_create_leaderboard_view.sql** - Creates the leaderboard view
5. **005_create_user_functions.sql** - Creates database functions for user management
6. **006_create_triggers.sql** - Creates triggers for automatic timestamp updates

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each script in order
4. Click "Run" for each script
5. Verify no errors occurred

## What Gets Created

### Tables
- **users** - User profiles linked to wallet addresses
- **game_rooms** - Multiplayer game rooms
- **game_results** - Match history and outcomes

### Views
- **leaderboard** - Top 100 players ranked by points

### Functions
- **get_or_create_user_by_wallet()** - Auto-creates users on first wallet connection
- **increment_user_wins()** - Updates win stats
- **increment_user_losses()** - Updates loss stats

### Triggers
- Auto-update timestamps on record changes

## Notes

- All tables have Row Level Security (RLS) enabled
- Policies allow public read/write (wallet-based auth handles security)
- Indexes are created for optimal query performance
