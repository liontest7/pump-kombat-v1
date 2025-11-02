# Pump Kombat - Setup Instructions

## Database Setup (CRITICAL - Must be done first!)

The application requires a Supabase database with specific tables and functions. Follow these steps:

### 1. Run Database Scripts

Go to your Supabase project dashboard → SQL Editor and run these scripts **in order**:

1. `scripts/001_create_users_table.sql` - Creates users table
2. `scripts/002_create_game_rooms_table.sql` - Creates game rooms table
3. `scripts/003_create_game_results_table.sql` - Creates game results table
4. `scripts/004_create_leaderboard_view.sql` - Creates leaderboard view
5. `scripts/005_create_user_functions.sql` - Creates user management functions
6. `scripts/006_create_triggers.sql` - Creates triggers
7. `scripts/007_create_user_stats_functions.sql` - Creates stats functions
8. `scripts/008_update_users_for_wallet_auth.sql` - Updates for wallet auth
9. `scripts/009_make_fighters_optional.sql` - Makes fighters optional
10. `scripts/010_ensure_all_functions_exist.sql` - Ensures all functions exist
11. `scripts/001-add-room-features.sql` - **NEW** Adds room_name and map columns

### 2. Environment Variables

Make sure your `.env.local` file has these variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://gvlvzyeagcgucrnjtilu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 3. Verify Setup

After running all scripts, verify in Supabase:

- Tables exist: `users`, `game_rooms`, `game_results`
- Views exist: `leaderboard`
- Functions exist: `get_or_create_user_by_wallet`, `increment_user_wins`, `increment_user_losses`
- Columns exist in `game_rooms`: `room_name`, `map`

## New Features

### Room Names & Map Selection

After running the migration script `001-add-room-features.sql`:
- Users can set custom room names when creating rooms
- Users can select from 6 battle arenas or choose random
- Room names display in the lobby

**Available Maps:**
1. Boxi Arena (`boxi_final`)
2. Intimes District (`intimes`)
3. Nordkiez Streets (`nordkiez2`)
4. RAW Temple (`raw1`)
5. RAW Courtyard (`raw2`)
6. Rigaer Straße (`rigaer1`)
7. Random Map (randomly selects one)

### Username System

- First-time users see a username selection dialog
- Usernames can be changed in the profile page
- Usernames display correctly in lobby, rooms, and leaderboard
- Username changes persist across sessions

## Common Issues

### "Could not find the 'room_name' column"

**Solution:** Run `scripts/001-add-room-features.sql` in Supabase SQL Editor

### "Could not find function get_or_create_user_by_wallet"

**Solution:** Run `scripts/010_ensure_all_functions_exist.sql` in Supabase SQL Editor

### "Username not updating after change"

**Solution:** The system now properly refreshes user data and reloads the page after username changes

### "Rooms don't appear in lobby after creation"

**Solution:** This was fixed by updating `CreateRoomDialog` to use `gameService.createRoom()` which saves to Supabase

### "Invalid input syntax for type uuid"

**Solution:** The app now properly uses Supabase UUIDs for room IDs instead of local string IDs

## How It Works

1. **Room Creation**: When you create a room, it's saved to Supabase database with optional name and map
2. **Lobby Display**: The lobby fetches rooms from Supabase in real-time
3. **Real-time Updates**: Uses Supabase Realtime to sync room changes
4. **Wallet Auth**: Users are automatically created in database when they connect wallet
5. **Username Management**: Usernames are stored in the database and synced across all pages

## Testing

1. Connect your Solana wallet
2. Set your username (first-time dialog)
3. Create a room with custom name and map selection
4. Room should appear in lobby immediately with your chosen name
5. Other players can see and join your room
6. Real-time updates work for all players
7. Change username in profile page and verify it updates everywhere
