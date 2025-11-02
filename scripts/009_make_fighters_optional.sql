-- Make fighter fields optional since fighters are selected after room creation
alter table public.game_rooms 
  alter column host_fighter drop not null;

-- Add comment to clarify the flow
comment on column public.game_rooms.host_fighter is 'Fighter selected by host after room is created and both players join';
comment on column public.game_rooms.opponent_fighter is 'Fighter selected by opponent after joining the room';
