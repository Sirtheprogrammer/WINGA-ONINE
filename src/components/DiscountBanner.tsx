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
    <div className={`${backgroundColor} ${textColor} py-4 px-6 rounded-lg shadow-lg mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Ends in:</div>
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