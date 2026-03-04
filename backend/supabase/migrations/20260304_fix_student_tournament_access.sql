-- Fix RLS policies to allow students to see tournaments they participate in

-- Drop existing policy for tournament participants
DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;

-- Create updated policy that allows students to see participants of tournaments they participate in
CREATE POLICY "Users can view tournament participants" ON tournament_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = tournament_participants.tournament_id 
      AND (tournaments.is_public = true OR auth.jwt() ->> 'role' IN ('trainer', 'admin') OR
           tournament_participants.user_id = (auth.jwt() ->> 'user_id')::uuid)
    )
  );

-- Drop existing policy for tournaments view
DROP POLICY IF EXISTS "Anyone can view public tournaments" ON tournaments;

-- Create updated policy that allows students to see tournaments they participate in
CREATE POLICY "Anyone can view public tournaments" ON tournaments
  FOR SELECT USING (
    is_public = true OR 
    auth.jwt() ->> 'role' IN ('trainer', 'admin') OR
    EXISTS (
      SELECT 1 FROM tournament_participants 
      WHERE tournament_participants.tournament_id = tournaments.id 
      AND tournament_participants.user_id = (auth.jwt() ->> 'user_id')::uuid
    )
  );

-- Drop existing policy for tournament tasks
DROP POLICY IF EXISTS "Anyone can view tasks from tournaments they can access" ON tournament_tasks;

-- Create updated policy for tournament tasks
CREATE POLICY "Anyone can view tasks from tournaments they can access" ON tournament_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = tournament_tasks.tournament_id 
      AND (tournaments.is_public = true OR auth.jwt() ->> 'role' IN ('trainer', 'admin') OR
           EXISTS (
             SELECT 1 FROM tournament_participants 
             WHERE tournament_participants.tournament_id = tournaments.id 
             AND tournament_participants.user_id = (auth.jwt() ->> 'user_id')::uuid
           ))
    )
  );

-- Drop existing policy for tournament results
DROP POLICY IF EXISTS "Anyone can view tournament results" ON tournament_results;

-- Create updated policy for tournament results
CREATE POLICY "Anyone can view tournament results" ON tournament_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = tournament_results.tournament_id 
      AND (tournaments.is_public = true OR auth.jwt() ->> 'role' IN ('trainer', 'admin') OR
           EXISTS (
             SELECT 1 FROM tournament_participants 
             WHERE tournament_participants.tournament_id = tournaments.id 
             AND tournament_participants.user_id = (auth.jwt() ->> 'user_id')::uuid
           ))
    )
  );
