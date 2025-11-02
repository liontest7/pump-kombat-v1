-- Add room_name and map columns to game_rooms table
ALTER TABLE public.game_rooms 
ADD COLUMN IF NOT EXISTS room_name text,
ADD COLUMN IF NOT EXISTS map text;

-- Add comment
COMMENT ON COLUMN public.game_rooms.room_name IS 'Custom name for the room (optional)';
COMMENT ON COLUMN public.game_rooms.map IS 'Selected map/stage for the battle';
