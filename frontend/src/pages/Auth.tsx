import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

const Auth = () => {
  const { session, loading, signInWithGoogle, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      if (profile && !profile.onboarded) {
        navigate("/onboarding");
      } else if (profile?.onboarded) {
        navigate("/dashboard");
      }
    }
  }, [loading, session, profile, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background matrix-bg">
        <div className="animate-pulse-glow text-primary font-mono text-lg">
          Initializing...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background matrix-bg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo/Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-primary/30 bg-primary/5 neon-glow">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-mono text-primary neon-text">
            CodeArena
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            &gt; Programming Tournament Platform_
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-6 neon-border">
          <div className="space-y-2">
            <p className="text-sm font-mono text-muted-foreground">
              <span className="text-primary">$</span> authenticate --provider google
            </p>
          </div>

          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/80 neon-glow transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>

          <div className="text-xs text-muted-foreground font-mono text-center">
            <span className="text-primary/50">//</span> secure authentication via OAuth 2.0
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground font-mono">
          v1.0.0 | &copy; {new Date().getFullYear()} CodeArena
        </p>
      </div>
    </div>
  );
};

export default Auth;
