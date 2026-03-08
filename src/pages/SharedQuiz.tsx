import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { QuizConfig } from "@/lib/topics";

const SharedQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedQuiz();
  }, [id]);

  const loadSharedQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/quiz/setup");
        return;
      }

      const config: QuizConfig = {
        topic: data.topic,
        difficulty: data.difficulty,
        questionType: data.question_type,
        numQuestions: data.num_questions,
      };

      navigate("/quiz/play", { state: { config } });
    } catch {
      navigate("/quiz/setup");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
};

export default SharedQuiz;
