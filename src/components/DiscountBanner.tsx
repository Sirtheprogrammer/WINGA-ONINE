import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface DiscountBannerProps {
  title: string;
  description: string;
  endDate: string;
  backgroundColor?: string;
  textColor?: string;
}

export const DiscountBanner: React.FC<DiscountBannerProps> = ({
  title,
  description,
  endDate,
  backgroundColor = 'bg-gradient-to-r from-red-500 to-pink-600',
  textColor = 'text-white'
}) => {
  return (
    <div className={`${backgroundColor} ${textColor} py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg mb-4 sm:mb-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold truncate">{title}</h3>
            <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm opacity-90 mb-1">Ends in:</div>
            <CountdownTimer 
              endDate={endDate}
              className={textColor}
              showIcon={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};