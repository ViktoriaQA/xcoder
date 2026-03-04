-- Update RLS policy to allow trainers to join tournaments
DROP POLICY IF EXISTS "Users can join tournaments" ON tournament_participants;

CREATE POLICY "Users can join tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::uuid AND
    auth.jwt() ->> 'role' IN ('student', 'trainer')
  );
