import React from 'react';
import { Gift, Sparkles, ShoppingBag, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { OfferSettings, CarouselType } from '../services/offerSettings';

interface OfferCarouselProps {
  settings: OfferSettings;
}

export const OfferCarousel: React.FC<OfferCarouselProps> = ({ settings }) => {

  // Normal carousel (default) - show when inactive or type is normal
  if (!settings.isActive || settings.carouselType === 'normal') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sm:py-6 px-4 sm:px-6 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-bold mb-1">{settings.title || 'Welcome to BEIPOA online'}</h3>
              <p className="text-sm sm:text-base opacity-90">{settings.description || 'Shop the best deals and affordable products in Tanzania'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Christmas & New Year carousel
  if (settings.carouselType === 'christmas') {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-red-500 to-blue-700 text-white py-4 sm:py-6 px-4 sm:px-6 rounded-lg shadow-lg mb-4 sm:mb-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 text-4xl">🎄</div>
            <div className="absolute top-8 right-8 text-3xl">🎁</div>
            <div className="absolute bottom-4 left-1/4 text-3xl">❄️</div>
            <div className="absolute bottom-8 right-1/4 text-4xl">🎅</div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 animate-pulse" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold mb-1">{settings.title || '🎄 Christmas & New Year Special! 🎉'}</h3>
                <p className="text-sm sm:text-base opacity-90">{settings.description || 'Celebrate with amazing deals and discounts!'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm opacity-90 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Ends in:</span>
                </div>
                <CountdownTimer 
                  endDate={settings.endDate}
                  className="text-white"
                  showIcon={false}
                />
              </div>
            </div>
          </div>
      </div>
    );
  }

  // Special Offer carousel
  if (settings.carouselType === 'special-offer') {
    return (
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-4 sm:py-6 px-4 sm:px-6 rounded-lg shadow-lg mb-4 sm:mb-6 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 animate-pulse" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-bold mb-1">{settings.title || '🔥 Special Offer - Limited Time!'}</h3>
              <p className="text-sm sm:text-base opacity-90">{settings.description || 'Don\'t miss out on these amazing deals!'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm opacity-90 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Ends in:</span>
              </div>
              <CountdownTimer 
                endDate={settings.endDate}
                className="text-white"
                showIcon={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

