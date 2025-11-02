-- Enable Realtime for game_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- Enable Realtime for users table (for leaderboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Add comment
COMMENT ON PUBLICATION supabase_realtime IS 'Enables real-time subscriptions for game rooms and user updates';
