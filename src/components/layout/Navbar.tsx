import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">QuizIQ</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/quiz/setup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Start Quiz</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth">Log in</Link></Button>
              <Button size="sm" asChild><Link to="/auth?mode=signup">Sign up</Link></Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/quiz/setup" className="text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Start Quiz</Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>Log out</Button>
            ) : (
              <Button size="sm" asChild><Link to="/auth" onClick={() => setMobileOpen(false)}>Log in</Link></Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
