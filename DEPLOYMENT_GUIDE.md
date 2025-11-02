# Pump Kombat - Complete Deployment Guide

This guide will help you deploy Pump Kombat to production with all necessary configurations.

## Prerequisites

- Supabase account and project
- Vercel account (for deployment)
- Solana wallet for testing

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Note down your project URL and keys from Settings → API

### 1.2 Run Database Scripts

Go to your Supabase project dashboard → SQL Editor and run these scripts **in order**:

1. **001_create_users_table.sql** - Creates the users table with wallet authentication
2. **002_create_game_rooms_table.sql** - Creates game rooms table for matches
3. **003_create_game_results_table.sql** - Creates game results for history
4. **004_create_leaderboard_view.sql** - Creates leaderboard view
5. **005_create_update_timestamp_function.sql** - Creates auto-update timestamp trigger
6. **006_create_user_stats_functions.sql** - Creates helper functions for user stats
7. **007_enable_realtime.sql** - Enables real-time subscriptions

**Important:** Run each script one at a time and verify there are no errors before proceeding to the next one.

### 1.3 Verify Database Setup

After running all scripts, verify in Supabase:

**Tables:**
- ✅ users
- ✅ game_rooms
- ✅ game_results

**Views:**
- ✅ leaderboard

**Functions:**
- ✅ increment_user_wins
- ✅ increment_user_losses
- ✅ get_or_create_user_by_wallet
- ✅ update_updated_at_column

## Step 2: Environment Variables

### 2.1 Copy Environment Template

Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2.2 Update Environment Variables

The `.env.example` file already contains the correct values for your Supabase project:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://gvlvzyeagcgucrnjtilu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Security Note:** The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client. It's only used in server-side API routes.

## Step 3: Local Development

### 3.1 Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3.2 Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### 3.3 Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Connect your Solana wallet
3. Create a test room
4. Verify the room appears in the lobby
5. Test joining a room with another wallet

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

### 4.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click "Deploy"

### 4.3 Verify Production Deployment

1. Visit your deployed URL
2. Connect wallet and test all features
3. Check Vercel logs for any errors
4. Monitor Supabase dashboard for database activity

## Step 5: Post-Deployment

### 5.1 Enable Supabase Realtime

Verify that Realtime is enabled for your tables:

1. Go to Supabase Dashboard → Database → Replication
2. Ensure `game_rooms` and `users` tables are enabled for replication

### 5.2 Monitor Performance

- Check Vercel Analytics for performance metrics
- Monitor Supabase Dashboard for database usage
- Set up alerts for errors in Vercel

### 5.3 Security Checklist

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Service role key is only used server-side
- ✅ Environment variables are properly configured
- ✅ CORS is properly configured in Supabase

## Troubleshooting

### Issue: "Could not find function get_or_create_user_by_wallet"

**Solution:** Run script `006_create_user_stats_functions.sql` in Supabase SQL Editor

### Issue: "Rooms don't appear in lobby"

**Solution:** 
1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Check browser console for errors

### Issue: "Real-time updates not working"

**Solution:**
1. Run script `007_enable_realtime.sql`
2. Verify Realtime is enabled in Supabase Dashboard
3. Check browser console for WebSocket errors

### Issue: "User creation fails"

**Solution:**
1. Check that all database scripts ran successfully
2. Verify foreign key constraints are correct
3. Check Supabase logs for detailed error messages

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs in the dashboard
4. Review the database schema in Supabase

## Next Steps

- Add custom domain in Vercel
- Set up monitoring and alerts
- Configure backup strategy in Supabase
- Implement rate limiting for API routes
- Add analytics tracking
