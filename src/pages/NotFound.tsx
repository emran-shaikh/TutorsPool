import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 rounded-lg border border-border bg-card shadow-md animate-slide-in">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <img 
            src="/logo.png" 
            alt="TutorsPool Logo" 
            className="h-12 w-auto"
          />
          {/* <span className="text-2xl font-bold text-blue-900">
            Tutors<span className="text-orange-500">Pool</span>
          </span> */}
        </div>
        <h1 className="text-5xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl text-card-foreground mb-6">Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
