import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Check if this is a 404 error by looking at the pathname
    const is404Page = !location.pathname.includes('offline');
    setIs404(is404Page);
    
    if (is404Page) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }

    // Update network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location.pathname]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isOnline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="mb-8 h-24 w-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-6xl">📶</div>
          <h1 className="text-4xl font-bold text-foreground">No Internet Connection</h1>
          <p className="text-lg text-muted-foreground">
            Oops! It seems you're offline. Please check your internet connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="mb-8 h-24 w-auto"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
