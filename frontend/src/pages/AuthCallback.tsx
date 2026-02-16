import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthCallback = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (session) {
        if (profile && !profile.onboarded) {
          navigate("/onboarding");
        } else if (profile?.onboarded) {
          navigate("/dashboard");
        }
        // If profile is still loading, wait
      } else {
        // If no session, something went wrong, go to auth
        navigate("/auth");
      }
    }
  }, [loading, session, profile, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background matrix-bg">
      <div className="animate-pulse-glow text-primary font-mono text-lg">
        Authenticating...
      </div>
    </div>
  );
};

export default AuthCallback;