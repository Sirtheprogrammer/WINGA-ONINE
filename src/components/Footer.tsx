import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <p className="text-gray-400 text-center text-xs sm:text-sm">© 2025 BEIPOA online. All rights reserved.</p>
        <p className="text-gray-500 text-center text-xs mt-2">
          Powered by{' '}
          <a 
            href="https://codeskytz.site" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200 underline"
          >
            codeskytz
          </a>
          {' '}&{' '}
          <a 
            href="https://globalwisetech.site" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200 underline"
          >
            GLOBALWISE TECH
          </a>
        </p>
      </div>
    </footer>
  );
};