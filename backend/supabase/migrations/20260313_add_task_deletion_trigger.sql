-- Create trigger function to automatically delete tournament tasks when general task is deactivated
CREATE OR REPLACE FUNCTION delete_tournament_tasks_on_task_deactivate()
RETURNS TRIGGER AS $$
BEGIN
  -- When a general task is deactivated (is_active = false), also delete all tournament tasks that reference it
  IF NEW.is_active = false AND OLD.is_active = true THEN
    DELETE FROM tournament_tasks 
    WHERE task_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on tasks table
CREATE TRIGGER trigger_delete_tournament_tasks
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION delete_tournament_tasks_on_task_deactivate();

-- Add comment
COMMENT ON FUNCTION delete_tournament_tasks_on_task_deactivate() IS 'Automatically deletes tournament tasks when the referenced general task is deactivated';
