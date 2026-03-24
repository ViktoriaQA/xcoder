-- Fix tasks.created_by constraint to allow NULL for user deletion
-- This allows setting created_by to NULL when user is deleted

-- Drop existing foreign key constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

-- Add new foreign key constraint with ON DELETE SET NULL
ALTER TABLE tasks 
ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES custom_users(id) ON DELETE SET NULL;

-- Do the same for tournament_tasks table
ALTER TABLE tournament_tasks DROP CONSTRAINT IF EXISTS tournament_tasks_created_by_fkey;

ALTER TABLE tournament_tasks 
ADD CONSTRAINT tournament_tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES custom_users(id) ON DELETE SET NULL;

-- Do the same for tournaments table  
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_created_by_fkey;

ALTER TABLE tournaments 
ADD CONSTRAINT tournaments_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES custom_users(id) ON DELETE SET NULL;
