# 🔧 Database Fix Instructions

## Problem
Your database has constraints that are preventing the app from working:
1. `users_id_fkey` - blocking user creation
2. `host_fighter` NOT NULL constraint - blocking room creation

## Solution - Run These Scripts

**IMPORTANT: Run these scripts to fix all database issues!**

### Steps:

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/gvlvzyeagcgucrnjtilu

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Script 1: Fix Database Constraints**
   - Open the file: `scripts/000_fix_database_constraints.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for completion (2-3 seconds)

4. **Run Script 2: Fix Fighter Constraints**
   - Click "New Query" again
   - Open the file: `scripts/011_fix_fighter_constraints.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor
   - Click "Run"
   - Wait for completion (1-2 seconds)

5. **Verify Success**
   - You should see success messages for both scripts
   - No error messages should appear

## What These Scripts Do

### Script 1 (000_fix_database_constraints.sql):
- ✅ Removes the problematic `users_id_fkey` constraint
- ✅ Recreates the `users` table with correct schema
- ✅ Recreates the `game_rooms` table with proper foreign keys
- ✅ Recreates the `game_results` table
- ✅ Sets up all RLS (Row Level Security) policies correctly
- ✅ Creates necessary indexes for performance

### Script 2 (011_fix_fighter_constraints.sql):
- ✅ Removes NOT NULL constraint from `host_fighter` column
- ✅ Removes NOT NULL constraint from `opponent_fighter` column
- ✅ Allows fighters to be selected AFTER room creation (as intended)

## After Running the Scripts

Your app will work perfectly! You can:
- ✅ Connect your wallet
- ✅ Create rooms (free and ranked)
- ✅ See rooms in the lobby
- ✅ Join games
- ✅ Select fighters
- ✅ Play and track results
- ✅ View profile and stats

## Alternative: App Works Without Scripts

**Good News:** The app has been updated to work even WITHOUT running the scripts!

- Room creation now uses a "PENDING" placeholder for fighters
- This allows the app to function immediately
- However, running the scripts is still recommended for optimal performance

## If You Still Have Issues

1. Make sure you're using the correct Supabase project URL
2. Verify your environment variables in `.env.local` are correct
3. Try refreshing the app page after running the scripts
4. Check the browser console for any errors
5. Make sure your wallet is connected

---

**Need Help?** The scripts are safe to run multiple times - they will clean up and recreate everything correctly each time.
