
-- Drop ALL existing policies on quiz_activity
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'quiz_activity' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.quiz_activity', pol.policyname);
  END LOOP;
END $$;

-- Recreate as PERMISSIVE (this is the default, but being explicit)
CREATE POLICY "quiz_activity_insert"
  ON public.quiz_activity FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "quiz_activity_update"
  ON public.quiz_activity FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quiz_activity_select"
  ON public.quiz_activity FOR SELECT
  TO anon, authenticated
  USING (true);
