import { createRoot } from "react-dom/client";
import "./index.css";

const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);

const root = createRoot(document.getElementById("root")!);

if (missing.length > 0) {
  console.error("Missing required environment variables:", missing);
  root.render(
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "hsl(150 20% 99%)",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 8,
          color: "hsl(200 25% 10%)",
        }}>
          Quiz<span style={{ color: "hsl(160 84% 39%)" }}>IQ</span>
        </div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 600,
          color: "hsl(200 25% 10%)",
          marginBottom: 12,
        }}>
          QuizIQ is temporarily unavailable
        </h1>
        <p style={{
          fontSize: 15,
          color: "hsl(200 10% 45%)",
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          The app configuration is incomplete or the service is being updated. Please try again soon.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 28px",
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            background: "hsl(160 84% 39%)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
} else {
  import("./App.tsx").then(({ default: App }) => {
    root.render(<App />);
  });
}
