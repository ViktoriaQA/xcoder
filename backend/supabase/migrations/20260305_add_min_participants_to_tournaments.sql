-- Add min_participants column to tournaments table
ALTER TABLE tournaments ADD COLUMN min_participants INTEGER;

-- Add a default value for existing records
UPDATE tournaments SET min_participants = 1 WHERE min_participants IS NULL;

-- Add a check constraint to ensure min_participants is positive and less than or equal to max_participants
ALTER TABLE tournaments ADD CONSTRAINT check_min_participants 
  CHECK (min_participants > 0 AND (max_participants IS NULL OR min_participants <= max_participants));

-- Add comment for documentation
COMMENT ON COLUMN tournaments.min_participants IS 'Minimum number of participants required for the tournament to start';
