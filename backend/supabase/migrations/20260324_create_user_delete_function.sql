-- Migration: Create cascade delete function for users
-- This function safely deletes a user and all their related data

-- Create function to delete user and all related data
CREATE OR REPLACE FUNCTION delete_user_cascade(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Log deletion
  INSERT INTO system_logs (action, details, user_id)
  VALUES ('user_deleted', json_build_object('deleted_user_id', target_user_id), target_user_id);

  -- Handle tasks table manually due to NOT NULL constraint
  -- First, delete any user progress for tasks created by this user
  DELETE FROM user_progress 
  WHERE task_id IN (
    SELECT id FROM tasks WHERE created_by = target_user_id
  );

  -- Delete task submissions for tasks created by this user
  DELETE FROM task_submissions 
  WHERE task_id IN (
    SELECT id FROM tasks WHERE created_by = target_user_id
  );

  -- Now delete the tasks created by this user
  DELETE FROM tasks WHERE created_by = target_user_id;

  -- Handle tournament_tasks similarly
  DELETE FROM user_progress 
  WHERE tournament_task_id IN (
    SELECT id FROM tournament_tasks WHERE created_by = target_user_id
  );

  DELETE FROM task_submissions 
  WHERE task_id IN (
    SELECT id FROM tournament_tasks WHERE created_by = target_user_id
  );

  DELETE FROM tournament_tasks WHERE created_by = target_user_id;

  -- Handle tournaments created by this user
  DELETE FROM tournament_participants WHERE tournament_id IN (
    SELECT id FROM tournaments WHERE created_by = target_user_id
  );

  DELETE FROM tournament_results WHERE tournament_id IN (
    SELECT id FROM tournaments WHERE created_by = target_user_id
  );

  DELETE FROM tournaments WHERE created_by = target_user_id;

  -- Note: Other tables will be automatically deleted due to CASCADE constraints:
  -- user_sessions, user_progress (remaining), tournament_participants (remaining), 
  -- task_submissions (remaining), tournament_results (remaining), 
  -- payment_attempts, user_subscriptions, receipts, 
  -- recurring_subscriptions, user_roles

  -- Finally delete the user
  DELETE FROM custom_users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION delete_user_cascade TO service_role;
