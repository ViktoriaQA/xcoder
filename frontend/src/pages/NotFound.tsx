import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthFab } from "@/components/AuthFab";
import { useIsMobile } from "@/hooks/use-mobile";

const NotFound = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted relative">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/" className="text-primary underline hover:text-primary/90">
            Go Home
          </a>
          <a href="/tournaments" className="text-primary underline hover:text-primary/90">
            View Tournaments
          </a>
        </div>
      </div>
      <AuthFab isMobile={isMobile} />
    </div>
  );
};

export default NotFound;
