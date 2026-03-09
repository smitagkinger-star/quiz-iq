
-- Drop the restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can insert quiz activity" ON public.quiz_activity;
DROP POLICY IF EXISTS "Anyone can update own quiz activity" ON public.quiz_activity;
DROP POLICY IF EXISTS "Authenticated users can read all activity" ON public.quiz_activity;

CREATE POLICY "Anyone can insert quiz activity"
  ON public.quiz_activity FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own quiz activity"
  ON public.quiz_activity FOR UPDATE
  TO anon, authenticated
  USING (
    (user_id = auth.uid())
    OR (anonymous_id IS NOT NULL AND user_id IS NULL)
  )
  WITH CHECK (
    (user_id = auth.uid())
    OR (anonymous_id IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Authenticated users can read all activity"
  ON public.quiz_activity FOR SELECT
  TO authenticated
  USING (true);
