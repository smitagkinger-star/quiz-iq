import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw, TrendingUp, LayoutDashboard, Share2, ExternalLink } from "lucide-react";
import { QuizConfig, QuizResult } from "@/lib/topics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state as { results: QuizResult[]; config: QuizConfig } | null;
  const [saved, setSaved] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  if (!state) {
    navigate("/quiz/setup");
    return null;
  }

  const { results, config } = state;
  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const accuracy = Math.round((correct / total) * 100);

  // Weak concepts
  const weakConcepts = Array.from(
    new Set(
      results
        .filter((r) => !r.isCorrect)
        .flatMap((r) => r.question.conceptTags || [])
    )
  ).slice(0, 5);

  // Learning resources based on weak concepts
  const getResources = () => {
    const resources: { title: string; url: string }[] = [];
    if (weakConcepts.length > 0) {
      resources.push({
        title: `${config.topic} - Official Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(config.topic + " official documentation")}`,
      });
      resources.push({
        title: `${weakConcepts[0]} - Tutorial`,
        url: `https://www.google.com/search?q=${encodeURIComponent(weakConcepts[0] + " tutorial")}`,
      });
      if (weakConcepts.length > 1) {
        resources.push({
          title: `${weakConcepts[1]} - Guide`,
          url: `https://www.google.com/search?q=${encodeURIComponent(weakConcepts[1] + " guide")}`,
        });
      }
    }
    return resources;
  };

  // Save results
  useEffect(() => {
    if (user && !saved) {
      saveResults();
    }
  }, [user]);

  const saveResults = async () => {
    if (!user) return;
    try {
      // Save quiz session
      const { data: session, error: sessionErr } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          topic: config.topic,
          difficulty: config.difficulty,
          question_type: config.questionType,
          num_questions: config.numQuestions,
          score: correct,
          accuracy,
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      // Save answers
      const answers = results.map((r) => ({
        session_id: session.id,
        question: r.question.question,
        user_answer: r.userAnswer,
        correct_answer: r.question.type === "mcq" ? r.question.correctAnswer : r.question.expectedAnswer,
        is_correct: r.isCorrect,
        concept_tags: r.question.conceptTags || [],
      }));

      await supabase.from("quiz_answers").insert(answers);

      // Save weak concepts
      if (weakConcepts.length > 0) {
        const concepts = weakConcepts.map((c) => ({
          user_id: user.id,
          concept: c,
          topic: config.topic,
        }));
        await supabase.from("weak_concepts").upsert(concepts, { onConflict: "user_id,concept" });
      }

      setSaved(true);
    } catch (err) {
      console.error("Failed to save results:", err);
    }
  };

  const handleShare = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_quizzes")
        .insert({
          topic: config.topic,
          difficulty: config.difficulty,
          question_type: config.questionType,
          num_questions: config.numQuestions,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      setShareId(data.id);
      const url = `${window.location.origin}/quiz/shared/${data.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Quiz link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to create share link");
    }
  };

  const resources = getResources();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Score */}
      <div className="quiz-card text-center">
        <div className="text-6xl font-extrabold gradient-text">{accuracy}%</div>
        <p className="mt-2 text-lg font-medium text-foreground">Quiz Complete!</p>
        <p className="text-sm text-muted-foreground">{config.topic} · Level {config.difficulty}</p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <CheckCircle className="h-5 w-5" /> {correct}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="rounded-lg bg-destructive/10 p-3">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-destructive">
              <XCircle className="h-5 w-5" /> {total - correct}
            </div>
            <div className="text-xs text-muted-foreground">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Weak Concepts */}
      {weakConcepts.length > 0 && (
        <div className="quiz-card mt-6">
          <h3 className="text-lg font-semibold text-foreground">Concepts to Review</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakConcepts.map((c) => (
              <span key={c} className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent-foreground">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div className="quiz-card mt-6">
          <h3 className="text-lg font-semibold text-foreground">Recommended Learning Resources</h3>
          <div className="mt-3 space-y-3">
            {resources.map((r) => (
              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> {r.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/quiz/play", { state: { config } })}>
          <RotateCcw className="mr-2 h-4 w-4" /> Retry Quiz
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate("/quiz/play", { state: { config: { ...config, difficulty: Math.min(config.difficulty + 1, 6) } } })}>
          <TrendingUp className="mr-2 h-4 w-4" /> Try Higher Level
        </Button>
        <Button className="flex-1" asChild>
          <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>
      <div className="mt-3">
        <Button variant="outline" className="w-full" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
