import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Play } from "lucide-react";
import { defaultTopics, QuestionType } from "@/lib/topics";

const QuizSetup = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [numQuestions, setNumQuestions] = useState("10");

  const selectedTopic = topic === "custom" ? customTopic : topic;

  const handleStart = () => {
    if (!selectedTopic.trim()) return;
    const config = {
      topic: selectedTopic,
      difficulty: parseInt(difficulty),
      questionType,
      numQuestions: parseInt(numQuestions),
    };
    navigate("/quiz/play", { state: { config } });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Brain className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-3xl font-bold text-foreground">Set Up Your Quiz</h1>
          <p className="mt-2 text-muted-foreground">Choose your topic and difficulty to get started.</p>
        </div>

        <div className="quiz-card space-y-6">
          {/* Topic */}
          <div>
            <Label>Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
              <SelectContent>
                {defaultTopics.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                <SelectItem value="custom">Custom topic...</SelectItem>
              </SelectContent>
            </Select>
            {topic === "custom" && (
              <Input className="mt-2" placeholder="Enter your custom topic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
            )}
          </div>

          {/* Difficulty */}
          <div>
            <Label>Difficulty Level</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    difficulty === String(d)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setDifficulty(String(d))}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div>
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Questions */}
          <div>
            <Label>Number of Questions</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    numQuestions === String(n)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setNumQuestions(String(n))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleStart} disabled={!selectedTopic.trim()}>
            <Play className="mr-2 h-4 w-4" /> Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSetup;
