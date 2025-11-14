import React from 'react';
import { Tag } from 'lucide-react';

interface DiscountBadgeProps {
  percentage: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'flash' | 'limited';
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ 
  percentage, 
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-red-500 text-white',
    flash: 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse',
    limited: 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
  };

  return (
    <div className={`
      inline-flex items-center rounded-full font-bold shadow-sm
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `}>
      <Tag className="h-3 w-3 mr-1" />
      -{percentage}%
    </div>
  );
};