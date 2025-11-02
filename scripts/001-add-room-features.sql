-- Add room_name and map columns to game_rooms table
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS room_name TEXT,
ADD COLUMN IF NOT EXISTS map TEXT DEFAULT 'nordkiez2';

-- Add comment for documentation
COMMENT ON COLUMN game_rooms.room_name IS 'Custom name for the room, displayed in lobby';
COMMENT ON COLUMN game_rooms.map IS 'Selected battle arena/map for the fight';
