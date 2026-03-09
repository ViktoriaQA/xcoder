-- Add show_on_public_page field to tournaments table
ALTER TABLE tournaments 
ADD COLUMN show_on_public_page BOOLEAN DEFAULT false;

-- Add comment to describe the new field
COMMENT ON COLUMN tournaments.show_on_public_page IS 'Controls visibility on public tournament pages. When true, tournament appears on public pages for all users.';
