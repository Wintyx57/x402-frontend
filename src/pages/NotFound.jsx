import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 | x402 Bazaar';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="glass-card rounded-xl p-10 max-w-md text-center">
        <div className="text-6xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-white font-bold text-xl mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 hover:brightness-110"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
