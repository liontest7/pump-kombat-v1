-- Fix Database Constraints
-- Run this FIRST to remove any problematic constraints from the database

-- Drop the problematic foreign key constraint on users table if it exists
DO $$ 
BEGIN
    -- Drop users_id_fkey constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped users_id_fkey constraint';
    END IF;
    
    -- Drop any other foreign key constraints on users.id column
    DECLARE
        constraint_record RECORD;
    BEGIN
        FOR constraint_record IN 
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'users' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%_id_fkey'
        LOOP
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
            RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
        END LOOP;
    END;
END $$;

-- Recreate the users table with correct schema (drop and recreate to ensure clean state)
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  token_balance decimal(20, 8) DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  total_games integer DEFAULT 0,
  ranking_points integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_select_all ON public.users;
DROP POLICY IF EXISTS users_insert_all ON public.users;
DROP POLICY IF EXISTS users_update_all ON public.users;

-- Create RLS policies (allow all operations)
CREATE POLICY users_select_all ON public.users FOR SELECT USING (true);
CREATE POLICY users_insert_all ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update_all ON public.users FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS users_ranking_points_idx ON public.users(ranking_points DESC);

-- Add comments
COMMENT ON TABLE public.users IS 'User profiles linked to crypto wallet addresses';
COMMENT ON COLUMN public.users.wallet_address IS 'Solana wallet public key (primary identifier)';
COMMENT ON COLUMN public.users.ranking_points IS 'ELO-style ranking points (starts at 1000)';

-- Recreate game_rooms table with proper foreign keys
DROP TABLE IF EXISTS public.game_rooms CASCADE;

CREATE TABLE public.game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  host_fighter text,
  opponent_fighter text,
  bet_amount decimal(20, 8) NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  winner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'ready', 'in_progress', 'finished', 'cancelled'))
);

-- Enable RLS on game_rooms
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS game_rooms_select_all ON public.game_rooms;
DROP POLICY IF EXISTS game_rooms_insert_all ON public.game_rooms;
DROP POLICY IF EXISTS game_rooms_update_all ON public.game_rooms;

-- Create RLS policies for game_rooms
CREATE POLICY game_rooms_select_all ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY game_rooms_insert_all ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY game_rooms_update_all ON public.game_rooms FOR UPDATE USING (true);

-- Create indexes for game_rooms
CREATE INDEX IF NOT EXISTS game_rooms_status_idx ON public.game_rooms(status);
CREATE INDEX IF NOT EXISTS game_rooms_host_id_idx ON public.game_rooms(host_id);
CREATE INDEX IF NOT EXISTS game_rooms_created_at_idx ON public.game_rooms(created_at DESC);

-- Recreate game_results table
DROP TABLE IF EXISTS public.game_results CASCADE;

CREATE TABLE public.game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  winner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  loser_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  winner_fighter text NOT NULL,
  loser_fighter text NOT NULL,
  bet_amount decimal(20, 8) NOT NULL,
  winner_moves jsonb,
  loser_moves jsonb,
  game_duration integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on game_results
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS game_results_select_all ON public.game_results;
DROP POLICY IF EXISTS game_results_insert_all ON public.game_results;

-- Create RLS policies for game_results
CREATE POLICY game_results_select_all ON public.game_results FOR SELECT USING (true);
CREATE POLICY game_results_insert_all ON public.game_results FOR INSERT WITH CHECK (true);

-- Create indexes for game_results
CREATE INDEX IF NOT EXISTS game_results_winner_id_idx ON public.game_results(winner_id);
CREATE INDEX IF NOT EXISTS game_results_loser_id_idx ON public.game_results(loser_id);
CREATE INDEX IF NOT EXISTS game_results_created_at_idx ON public.game_results(created_at DESC);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Database constraints fixed successfully!';
    RAISE NOTICE '✅ All tables recreated with correct schema';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE 'You can now use the application!';
END $$;
