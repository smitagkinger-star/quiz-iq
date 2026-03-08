import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import QuizSetup from "./pages/QuizSetup";
import QuizPlay from "./pages/QuizPlay";
import QuizResults from "./pages/QuizResults";
import Dashboard from "./pages/Dashboard";
import SharedQuiz from "./pages/SharedQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/quiz/setup" element={<QuizSetup />} />
            <Route path="/quiz/play" element={<QuizPlay />} />
            <Route path="/quiz/results" element={<QuizResults />} />
            <Route path="/quiz/shared/:id" element={<SharedQuiz />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
