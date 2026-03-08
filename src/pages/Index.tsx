import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Zap, BarChart3, Share2, BookOpen, Target, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const topics = [
  "Java", "Spring Boot", "SQL", "System Design", "Algorithms", "Docker",
  "Agile", "Kafka", "REST APIs", "Design Patterns", "Cloud Architecture",
  "CI/CD", "Math", "Physics", "Business Strategy", "Product Management",
];

const features = [
  { icon: Brain, title: "AI-Generated Questions", desc: "Get unique questions tailored to your chosen topic and difficulty level." },
  { icon: Zap, title: "Instant Feedback", desc: "Receive explanations and learn from every answer immediately." },
  { icon: BarChart3, title: "Track Progress", desc: "Dashboard with stats, charts, and performance insights." },
  { icon: Target, title: "Weak Concept Practice", desc: "AI detects your weak areas and generates targeted practice quizzes." },
  { icon: Share2, title: "Share Quizzes", desc: "Create quiz configs and share them with anyone via a link." },
  { icon: BookOpen, title: "Learning Resources", desc: "Get curated learning links based on concepts you missed." },
];

const steps = [
  { num: "01", title: "Choose a Topic", desc: "Pick from 30+ topics or enter your own custom subject." },
  { num: "02", title: "Set Difficulty", desc: "Choose level 1–6 and question type (MCQ, short answer, or mixed)." },
  { num: "03", title: "Take the Quiz", desc: "Answer AI-generated questions with instant feedback." },
  { num: "04", title: "Review & Improve", desc: "See your results, weak concepts, and curated learning resources." },
];

const faqs = [
  { q: "How does QuizIQ generate questions?", a: "QuizIQ uses advanced AI to generate unique questions based on your chosen topic, difficulty level, and question type. No two quizzes are exactly the same." },
  { q: "Is QuizIQ free to use?", a: "Yes! You can start taking quizzes right away. Sign up to save your progress and track performance over time." },
  { q: "What topics are available?", a: "We support 30+ built-in topics across programming, business, math, science, and more. You can also enter any custom topic." },
  { q: "Can I share quizzes with others?", a: "Absolutely! After completing a quiz, you can share the quiz configuration via a link. Anyone can take the same quiz." },
  { q: "How does weak concept practice work?", a: "QuizIQ tracks concepts you get wrong and lets you generate targeted practice quizzes focused on those areas." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Learning
            </span>
          </motion.div>
          <motion.h1
            className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-foreground md:text-6xl lg:text-7xl"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Learn Any Topic Faster with{" "}
            <span className="gradient-text">AI-Powered Quizzes</span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Generate quizzes for programming, business, math, science, agile, and more.
            Track your progress and get curated resources to improve.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/quiz/setup">Start Your First Quiz</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/quiz/setup?demo=true">View Demo Quiz</Link>
            </Button>
          </motion.div>

          {/* Topic pills */}
          <motion.div
            className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-2"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            {topics.map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Everything you need to learn smarter</h2>
            <p className="mt-4 text-muted-foreground">Powerful features to help you master any subject.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="quiz-card flex flex-col items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">Four simple steps to start learning.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-4xl font-extrabold gradient-text">{s.num}</span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-12 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="quiz-card group cursor-pointer">
                <summary className="flex items-center justify-between font-medium text-foreground">
                  {f.q}
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ready to test your knowledge?</h2>
          <p className="mt-4 text-muted-foreground">Start a quiz in seconds. No signup required.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/quiz/setup">Start Your First Quiz</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">QuizIQ</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 QuizIQ. AI-powered learning for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
