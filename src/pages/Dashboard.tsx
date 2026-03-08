import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface QuizSession {
  id: string;
  topic: string;
  difficulty: number;
  score: number;
  accuracy: number;
  num_questions: number;
  created_at: string;
}

interface WeakConcept {
  concept: string;
  topic: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [sessionsRes, conceptsRes] = await Promise.all([
      supabase.from("quiz_sessions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("weak_concepts").select("concept, topic").eq("user_id", user!.id),
    ]);
    setSessions((sessionsRes.data as QuizSession[]) || []);
    setWeakConcepts((conceptsRes.data as WeakConcept[]) || []);
    setLoading(false);
  };

  const totalQuizzes = sessions.length;
  const totalQuestions = sessions.reduce((s, q) => s + q.num_questions, 0);
  const avgScore = totalQuizzes > 0 ? Math.round(sessions.reduce((s, q) => s + q.score, 0) / totalQuizzes) : 0;
  const avgAccuracy = totalQuizzes > 0 ? Math.round(sessions.reduce((s, q) => s + q.accuracy, 0) / totalQuizzes) : 0;

  // Topic performance data
  const topicMap = new Map<string, { total: number; correct: number; count: number }>();
  sessions.forEach((s) => {
    const existing = topicMap.get(s.topic) || { total: 0, correct: 0, count: 0 };
    existing.total += s.num_questions;
    existing.correct += s.score;
    existing.count += 1;
    topicMap.set(s.topic, existing);
  });
  const chartData = Array.from(topicMap.entries())
    .map(([topic, d]) => ({ topic: topic.length > 15 ? topic.slice(0, 15) + "…" : topic, accuracy: Math.round((d.correct / d.total) * 100) }))
    .slice(0, 10);

  const handlePracticeWeak = () => {
    if (weakConcepts.length === 0) return;
    const topics = weakConcepts.map((c) => c.concept).join(", ");
    navigate("/quiz/play", {
      state: {
        config: {
          topic: `Weak concepts: ${topics}`,
          difficulty: 3,
          questionType: "mixed",
          numQuestions: 10,
        },
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = [
    { label: "Quizzes Taken", value: totalQuizzes, icon: Brain },
    { label: "Questions Answered", value: totalQuestions, icon: Target },
    { label: "Average Score", value: avgScore, icon: TrendingUp },
    { label: "Accuracy", value: `${avgAccuracy}%`, icon: Target },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Track your learning progress.</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="quiz-card flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weak Concepts */}
      {weakConcepts.length > 0 && (
        <div className="quiz-card mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Weak Concepts</h2>
            <Button size="sm" onClick={handlePracticeWeak}>Practice Weak Concepts</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakConcepts.map((c) => (
              <span key={c.concept} className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent-foreground">{c.concept}</span>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="quiz-card mt-8">
          <h2 className="text-lg font-semibold text-foreground">Topic Performance</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="topic" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Quizzes */}
      <div className="quiz-card mt-8">
        <h2 className="text-lg font-semibold text-foreground">Recent Quizzes</h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No quizzes yet. Start your first one!</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Topic</th>
                  <th className="pb-3 font-medium">Level</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 10).map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{s.topic}</td>
                    <td className="py-3 text-muted-foreground">{s.difficulty}</td>
                    <td className="py-3 text-foreground">{s.score}/{s.num_questions} ({s.accuracy}%)</td>
                    <td className="py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
