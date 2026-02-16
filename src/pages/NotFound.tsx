import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  // Note: In production, route errors would be logged to monitoring service
  useEffect(() => {
    // Log 404 errors for monitoring (replace with proper logging service in production)
    if (process.env.NODE_ENV === 'development') {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* SEO meta tags for 404 page */}
      <SEOHead
        title="Page Not Found | Amicus Edge"
        description="The page you're looking for doesn't exist. Return to the Amicus Edge homepage."
        path="/404"
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
