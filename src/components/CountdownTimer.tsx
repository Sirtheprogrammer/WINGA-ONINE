import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endDate, 
  onExpire, 
  className = '',
  showIcon = true 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onExpire?.();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className={`flex items-center text-red-500 text-sm font-medium ${className}`}>
        {showIcon && <Clock className="h-4 w-4 mr-1" />}
        <span>Offer Expired</span>
      </div>
    );
  }

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className={`flex items-center text-sm font-medium ${className}`}>
      {showIcon && <Clock className="h-4 w-4 mr-2" />}
      <div className="flex items-center space-x-1">
        {timeLeft.days > 0 && (
          <>
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {formatTime(timeLeft.days)}
            </div>
            <span className="text-xs">d</span>
          </>
        )}
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          {formatTime(timeLeft.hours)}
        </div>
        <span className="text-xs">:</span>
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          {formatTime(timeLeft.minutes)}
        </div>
        <span className="text-xs">:</span>
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          {formatTime(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
};