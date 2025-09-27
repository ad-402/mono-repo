// lib/adFallbacks.tsx
import React from 'react';

export const AdFallbacks = {
  getDefaultAd: (size: string): string => {
    const defaults = {
      banner: '/images/default-banner-ad.png',
      sidebar: '/images/default-sidebar-ad.png',
      square: '/images/default-square-ad.png',
      mobile: '/images/default-mobile-ad.png'
    };
    return defaults[size as keyof typeof defaults];
  },

  createPromotionalAd: (size: string): React.ReactElement => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded text-center">
      <h3 className="font-bold">Advertise Here!</h3>
      <p className="text-sm opacity-90">Reach thousands of users</p>
      <button className="mt-2 bg-white text-blue-600 px-3 py-1 rounded text-xs font-semibold">
        Get Started
      </button>
    </div>
  ),

  createPurchaseAd: (route: string, position: number, size: string): React.ReactElement => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded text-center hover:border-blue-400 transition-colors cursor-pointer">
      <div className="text-2xl mb-2">📢</div>
      <div className="text-sm font-medium text-gray-700 mb-1">Ad Space Available</div>
      <div className="text-xs text-gray-500 mb-3">
        {route} • Position {position} • {size}
      </div>
      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={() => {
          // Redirect to checkout with slot details
          const params = new URLSearchParams({
            slotId: `${route}-${position}`,
            price: '0.10',
            size: size,
            durations: '1h,6h,24h',
            category: 'general'
          });
          window.location.href = `/checkout?${params.toString()}`;
        }}
      >
        Purchase Ad Space
      </button>
    </div>
  ),

  createLoadingAd: (): React.ReactElement => (
    <div className="bg-gray-100 rounded flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading ad...</div>
    </div>
  ),

  createErrorAd: (error: string): React.ReactElement => (
    <div className="bg-red-50 border border-red-200 rounded flex items-center justify-center">
      <div className="text-red-600 text-sm">Failed to load ad: {error}</div>
    </div>
  )
};
