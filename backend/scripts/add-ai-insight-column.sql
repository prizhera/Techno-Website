-- Run this SQL in your Supabase Dashboard SQL Editor
-- Step 1: Create a helper function (only needed once per database)
CREATE OR REPLACE FUNCTION public.exec_sql(query_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query_text;
END;
$$;

-- Step 2: Add the ai_insight column to the questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_insight TEXT;

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'questions' AND column_name = 'ai_insight';
