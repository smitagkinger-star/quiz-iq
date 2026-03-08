export const defaultTopics = [
  "Java fundamentals",
  "Java concurrency",
  "JVM internals",
  "Spring Boot",
  "REST API design",
  "Distributed systems",
  "Event-driven architecture",
  "Kafka",
  "SQL",
  "Database indexing",
  "System design fundamentals",
  "Caching strategies",
  "Load balancing",
  "Big-O complexity",
  "Algorithms",
  "Concurrency fundamentals",
  "Design patterns",
  "SOLID principles",
  "Cloud architecture",
  "Docker",
  "CI/CD",
  "Observability",
  "Agile methodology",
  "Scrum framework",
  "Product management",
  "Probability and statistics",
  "Business strategy",
  "Physics fundamentals",
  "Algebra",
];

export type QuestionType = "mcq" | "short_answer" | "mixed";
export type QuizConfig = {
  topic: string;
  difficulty: number;
  questionType: QuestionType;
  numQuestions: number;
};

export interface MCQQuestion {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  conceptTags: string[];
}

export interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  expectedAnswer: string;
  explanation: string;
  conceptTags: string[];
}

export type QuizQuestion = MCQQuestion | ShortAnswerQuestion;

export interface QuizResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  feedback?: string;
}
