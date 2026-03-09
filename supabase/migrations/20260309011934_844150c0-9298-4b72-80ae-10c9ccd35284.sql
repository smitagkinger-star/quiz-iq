
-- Lightweight analytics: one row per quiz attempt, updated on completion
CREATE TABLE public.quiz_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  difficulty integer NOT NULL,
  question_type text NOT NULL,
  num_questions integer NOT NULL,
  user_id uuid DEFAULT NULL,
  anonymous_id text DEFAULT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  score integer DEFAULT NULL,
  accuracy integer DEFAULT NULL
);

-- RLS: allow anyone to insert and update their own rows
ALTER TABLE public.quiz_activity ENABLE ROW LEVEL SECURITY;

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

-- Indexes for efficient analytics queries
CREATE INDEX idx_quiz_activity_topic ON public.quiz_activity(topic);
CREATE INDEX idx_quiz_activity_difficulty ON public.quiz_activity(difficulty);
CREATE INDEX idx_quiz_activity_started_at ON public.quiz_activity(started_at);
