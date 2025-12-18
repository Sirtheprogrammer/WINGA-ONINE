import React from 'react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-50 bg-white flex items-center justify-center'
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 opacity-20 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

