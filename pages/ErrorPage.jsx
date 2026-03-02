import { useNavigate, useRouteError } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return {
        title: "404 - Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        icon: <AlertTriangle className="w-16 h-16 text-yellow-500" />
      };
    }

    return {
      title: "Oops! Something went wrong",
      message: error?.message || "An unexpected error occurred. Please try again.",
      icon: <AlertTriangle className="w-16 h-16 text-red-500" />
    };
  };

  const { title, message, icon } = getErrorMessage();

  const handleGoHome = () => {
    navigate('/home', { replace: true });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {icon}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Show error details
            </summary>
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 text-red-600">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Page
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-sm text-gray-500">
          Need help?{' '}
          <button
            onClick={() => navigate('/home')}
            className="text-black hover:underline font-medium"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}
