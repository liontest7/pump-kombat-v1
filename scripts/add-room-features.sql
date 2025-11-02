-- Add room_name and map columns to game_rooms table
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS room_name TEXT,
ADD COLUMN IF NOT EXISTS map TEXT DEFAULT 'nordkiez2';

-- Update existing rooms to have default map
UPDATE game_rooms 
SET map = 'nordkiez2' 
WHERE map IS NULL;
