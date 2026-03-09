import { supabase } from "@/integrations/supabase/client";

const ANON_ID_KEY = "quiziq_anon_id";

function getAnonymousId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export async function trackQuizStarted(config: {
  topic: string;
  difficulty: number;
  questionType: string;
  numQuestions: number;
  userId?: string | null;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("quiz_activity")
      .insert({
        topic: config.topic,
        difficulty: config.difficulty,
        question_type: config.questionType,
        num_questions: config.numQuestions,
        user_id: config.userId || null,
        anonymous_id: config.userId ? null : getAnonymousId(),
      })
      .select("id")
      .single();

    if (error) {
      console.warn("Analytics: failed to track quiz start", error.message);
      return null;
    }
    return data.id;
  } catch {
    return null;
  }
}

export async function trackQuizCompleted(
  activityId: string,
  score: number,
  accuracy: number
): Promise<void> {
  try {
    await supabase
      .from("quiz_activity")
      .update({
        completed_at: new Date().toISOString(),
        score,
        accuracy,
      })
      .eq("id", activityId);
  } catch {
    // Silent fail — analytics should never break the app
  }
}
