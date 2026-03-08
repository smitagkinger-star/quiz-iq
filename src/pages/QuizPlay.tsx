import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { QuizConfig, QuizQuestion, QuizResult } from "@/lib/topics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QuizPlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = (location.state as { config: QuizConfig })?.config;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ isCorrect: boolean; score: number; feedback?: string } | null>(null);

  useEffect(() => {
    if (!config) {
      navigate("/quiz/setup");
      return;
    }
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          topic: config.topic,
          difficulty: config.difficulty,
          questionType: config.questionType,
          numQuestions: config.numQuestions,
        },
      });
      if (error) throw error;
      setQuestions(data.questions);
    } catch (err: any) {
      toast.error("Failed to generate quiz. Please try again.");
      console.error(err);
      navigate("/quiz/setup");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    const userAnswer = currentQuestion.type === "mcq" ? selectedAnswer : shortAnswer;
    if (!userAnswer.trim()) return;

    if (currentQuestion.type === "short_answer") {
      setEvaluating(true);
      try {
        const { data, error } = await supabase.functions.invoke("evaluate-answer", {
          body: {
            question: currentQuestion.question,
            expectedAnswer: currentQuestion.expectedAnswer,
            userAnswer,
          },
        });
        if (error) throw error;
        const result: QuizResult = {
          question: currentQuestion,
          userAnswer,
          isCorrect: data.isCorrect,
          score: data.score,
          feedback: data.feedback,
        };
        setCurrentFeedback({ isCorrect: data.isCorrect, score: data.score, feedback: data.feedback });
        setResults((prev) => [...prev, result]);
      } catch {
        // Fallback: simple string match
        const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.expectedAnswer.toLowerCase().trim();
        const result: QuizResult = { question: currentQuestion, userAnswer, isCorrect, score: isCorrect ? 1 : 0 };
        setCurrentFeedback({ isCorrect, score: isCorrect ? 1 : 0 });
        setResults((prev) => [...prev, result]);
      } finally {
        setEvaluating(false);
      }
    } else {
      const isCorrect = userAnswer === currentQuestion.correctAnswer;
      const result: QuizResult = { question: currentQuestion, userAnswer, isCorrect, score: isCorrect ? 1 : 0 };
      setCurrentFeedback({ isCorrect, score: isCorrect ? 1 : 0 });
      setResults((prev) => [...prev, result]);
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer("");
      setShortAnswer("");
      setSubmitted(false);
      setCurrentFeedback(null);
    } else {
      navigate("/quiz/results", { state: { results, config } });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-foreground">Generating your quiz...</p>
          <p className="mt-1 text-sm text-muted-foreground">AI is creating questions about {config?.topic}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>{config.topic} · Level {config.difficulty}</span>
        <span>Question {currentIndex + 1} of {questions.length}</span>
      </div>
      <Progress value={progress} className="mb-8 h-2" />

      {/* Question Card */}
      <div className="quiz-card">
        <h2 className="text-xl font-semibold text-foreground">{currentQuestion.question}</h2>

        {currentQuestion.type === "mcq" ? (
          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((opt) => {
              let optClass = "border-border bg-card text-foreground hover:bg-muted";
              if (submitted) {
                if (opt === currentQuestion.correctAnswer) optClass = "border-primary bg-primary/10 text-primary";
                else if (opt === selectedAnswer && opt !== currentQuestion.correctAnswer) optClass = "border-destructive bg-destructive/10 text-destructive";
              } else if (opt === selectedAnswer) {
                optClass = "border-primary bg-primary/5 text-primary";
              }
              return (
                <button
                  key={opt}
                  className={`w-full rounded-lg border p-4 text-left text-sm font-medium transition-colors ${optClass}`}
                  onClick={() => !submitted && setSelectedAnswer(opt)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <Input
              placeholder="Type your answer..."
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={submitted}
            />
          </div>
        )}

        {/* Feedback */}
        {submitted && currentFeedback && (
          <div className={`mt-6 rounded-lg p-4 ${currentFeedback.isCorrect ? "bg-primary/10" : "bg-destructive/10"}`}>
            <div className="flex items-center gap-2">
              {currentFeedback.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={`font-semibold ${currentFeedback.isCorrect ? "text-primary" : "text-destructive"}`}>
                {currentFeedback.isCorrect ? "Correct!" : currentFeedback.score > 0 ? "Partially Correct" : "Incorrect"}
              </span>
            </div>
            {currentFeedback.feedback && (
              <p className="mt-2 text-sm text-muted-foreground">{currentFeedback.feedback}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={evaluating || (!selectedAnswer && !shortAnswer.trim())} className="w-full">
              {evaluating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</> : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                "View Results"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;
