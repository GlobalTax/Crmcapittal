-- Add tags column to user_tasks table for Linear-style multi-tag support
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add index for better performance when filtering by tags
CREATE INDEX IF NOT EXISTS idx_user_tasks_tags ON public.user_tasks USING GIN(tags);

-- Add comment for documentation
COMMENT ON COLUMN public.user_tasks.tags IS 'Array of tags for organizing tasks (Linear-style)';