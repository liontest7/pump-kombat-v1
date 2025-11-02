# Quick Start Guide - Pump Kombat

## 🚀 Get Your Game Running in 5 Minutes

### Step 1: Set Up Environment Variables

Create a `.env.local` file in the root directory with these values:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gvlvzyeagcgucrnjtilu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bHZ6eWVhZ2NndWNybmp0aWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2MzEsImV4cCI6MjA3Njg3NzYzMX0.3xmiDPKFLIzfMBwaQA2jndgs7KOj5ZPgzc9VN889Hs4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bHZ6eWVhZ2NndWNybmp0aWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMwMTYzMSwiZXhwIjoyMDc2ODc3NjMxfQ.cljE_jdZ7Na04wKTIuAXyBWvPGJ-yCVxBCh-E7LAYcU

# Optional: Development redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

**✅ These are your actual credentials - just copy and paste!**

### Step 2: Set Up Database

Go to your Supabase project dashboard and run these SQL scripts **in order**:

1. **001_create_users_table.sql** - Creates users table with wallet authentication
2. **002_create_game_rooms_table.sql** - Creates game rooms table
3. **003_create_game_results_table.sql** - Creates game results for history
4. **004_create_leaderboard_view.sql** - Creates leaderboard view
5. **005_create_update_timestamp_function.sql** - Creates auto-update triggers
6. **006_create_user_stats_functions.sql** - Creates helper functions
7. **007_enable_realtime.sql** - Enables real-time subscriptions
8. **008_add_room_name_and_map_columns.sql** - ⚠️ **IMPORTANT: Run this if you already have a database!** Adds room_name and map columns

**How to run scripts:**
1. Go to https://supabase.com/dashboard/project/gvlvzyeagcgucrnjtilu
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the script content
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. Verify success message appears
7. Repeat for each script in order

**⚠️ If you already have a database running:** You MUST run script **008_add_room_name_and_map_columns.sql** to add the missing columns. This will fix the "Could not find the 'room_name' column" error.

### Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 4: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### Step 5: Test the System

1. **Open the app**: Go to http://localhost:3000
2. **Connect Wallet**: Click "Connect Wallet" and connect your Solana wallet
3. **Create Room**: Click "Create Room" in the lobby
   - Give it a custom name (optional)
   - Choose a map or select "Random Arena"
   - Select Practice Mode (free) or Ranked Match (with tokens)
4. **Verify**: Room should appear in the "Open Rooms" list with your custom name
5. **Test Bot**: In a free practice room, click "Play vs Bot" to test AI opponent
6. **Join Room**: Open in another browser/incognito and join the room
7. **Play**: Select fighters and battle!

## 🔍 Troubleshooting

### "Could not find the 'room_name' column" or "Could not find the 'map' column"
- **Solution**: Run script **008_add_room_name_and_map_columns.sql** in your Supabase SQL Editor
- This adds the missing columns to existing databases

### "null value in column 'id' violates not-null constraint" (Bot creation)
- **Fixed**: The latest code separates bot user insertion from selection
- If still occurring, verify you're using the latest version of the code

### "User not found" or "Failed to create user"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `.env.local`
- Check that all database scripts ran successfully
- Look for errors in Supabase Dashboard → Logs

### "Failed to create room"
- Make sure wallet is connected
- Check browser console for errors (press F12)
- Verify all database scripts ran successfully (including script 008!)

### Rooms not appearing in lobby
- Refresh the page
- Check that script `007_enable_realtime.sql` ran successfully
- Verify in Supabase Dashboard → Database → Replication that `game_rooms` is enabled

### Bot button not showing in free rooms
- Verify you're the room creator
- Make sure the room has bet_amount = 0 (free practice)
- Check that no opponent has joined yet
- Look for `[v0] Bot button visibility check` in browser console (F12)

### Real-time updates not working
- Run script `007_enable_realtime.sql`
- Check browser console for WebSocket errors
- Verify Realtime is enabled in Supabase Dashboard

## 📊 Verify Database Setup

Go to Supabase Dashboard → Table Editor and verify these exist:

**Tables:**
- ✅ users
- ✅ game_rooms (with room_name and map columns)
- ✅ game_results

**Views:**
- ✅ leaderboard

**Functions:**
- ✅ increment_user_wins
- ✅ increment_user_losses
- ✅ get_or_create_user_by_wallet
- ✅ update_updated_at_column

## 🎮 Ready to Launch Checklist

1. ✅ Environment variables set in `.env.local`
2. ✅ All 8 database scripts executed successfully (including 008!)
3. ✅ Dependencies installed (`npm install`)
4. ✅ Development server running (`npm run dev`)
5. ✅ Wallet connects successfully
6. ✅ Can create rooms with custom names
7. ✅ Can invite bots to free practice rooms
8. ✅ Can join rooms and select fighters
9. ✅ Real-time updates working

**All working? You're ready to deploy! 🚀**

## 🚀 Deploy to Production

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions to Vercel.

## Need Help?

1. **Check browser console** (F12) - all logs are prefixed with `[v0]`
2. **Check Supabase logs** - Dashboard → Logs → API
3. **Verify database tables** - Dashboard → Table Editor
4. **Check environment variables** - Make sure all are set correctly

---

**Note:** The database scripts are safe to run multiple times. They use `IF NOT EXISTS` clauses to prevent errors.
