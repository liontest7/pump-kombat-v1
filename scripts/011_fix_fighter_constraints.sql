-- Fix NOT NULL constraints on fighter columns
-- These should be nullable since fighters are selected AFTER room creation

-- Remove NOT NULL constraint from host_fighter if it exists
ALTER TABLE public.game_rooms 
  ALTER COLUMN host_fighter DROP NOT NULL;

-- Remove NOT NULL constraint from opponent_fighter if it exists  
ALTER TABLE public.game_rooms 
  ALTER COLUMN opponent_fighter DROP NOT NULL;

-- Verify the changes
COMMENT ON COLUMN public.game_rooms.host_fighter IS 'Fighter selected by host (null until player selects)';
COMMENT ON COLUMN public.game_rooms.opponent_fighter IS 'Fighter selected by opponent (null until player selects)';
