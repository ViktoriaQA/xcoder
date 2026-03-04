-- Add task_id field to tournament_tasks to reference original library tasks
ALTER TABLE tournament_tasks ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_tasks_task_id ON tournament_tasks(task_id);

-- Add unique constraint to prevent adding the same library task multiple times to the same tournament
ALTER TABLE tournament_tasks ADD CONSTRAINT tournament_tasks_unique_library_task 
  UNIQUE(tournament_id, task_id) 
  DEFERRABLE INITIALLY DEFERRED;

-- Add comment
COMMENT ON COLUMN tournament_tasks.task_id IS 'Reference to the original task in the library tasks table';
