-- Migration script to add room_name and map columns to existing game_rooms table
-- Run this if your database was created before these columns were added

-- Add room_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_rooms' AND column_name = 'room_name'
  ) THEN
    ALTER TABLE public.game_rooms ADD COLUMN room_name text;
    COMMENT ON COLUMN public.game_rooms.room_name IS 'Optional custom name for the room';
  END IF;
END $$;

-- Add map column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_rooms' AND column_name = 'map'
  ) THEN
    ALTER TABLE public.game_rooms ADD COLUMN map text;
    COMMENT ON COLUMN public.game_rooms.map IS 'Selected battle arena/map for the match';
  END IF;
END $$;
