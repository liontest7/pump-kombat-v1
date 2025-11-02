-- Function to increment user wins
CREATE OR REPLACE FUNCTION increment_user_wins(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    wins = wins + 1,
    total_games = total_games + 1,
    ranking_points = ranking_points + 25
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment user losses
CREATE OR REPLACE FUNCTION increment_user_losses(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    losses = losses + 1,
    total_games = total_games + 1,
    ranking_points = GREATEST(ranking_points - 15, 0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create user by wallet address
CREATE OR REPLACE FUNCTION get_or_create_user_by_wallet(wallet_addr TEXT)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Try to get existing user
  SELECT id INTO user_uuid
  FROM users
  WHERE wallet_address = wallet_addr;
  
  -- If user doesn't exist, create one
  IF user_uuid IS NULL THEN
    INSERT INTO users (wallet_address, username, token_balance, wins, losses, total_games, ranking_points)
    VALUES (wallet_addr, 'Player_' || SUBSTRING(wallet_addr, 1, 6), 0, 0, 0, 0, 1000)
    RETURNING id INTO user_uuid;
  END IF;
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION increment_user_wins(UUID) IS 'Increments user wins and updates ranking points';
COMMENT ON FUNCTION increment_user_losses(UUID) IS 'Increments user losses and updates ranking points';
COMMENT ON FUNCTION get_or_create_user_by_wallet(TEXT) IS 'Gets existing user or creates new user by wallet address';
