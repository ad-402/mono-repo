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
    <div className="bg-accent text-accent-foreground p-4 text-center">
      <h3 className="font-bold">Advertise Here!</h3>
      <p className="text-sm opacity-80">Reach thousands of users</p>
      <button className="mt-2 bg-background text-foreground px-3 py-1 text-xs font-semibold border border-border">
        Get Started
      </button>
    </div>
  ),

  createPurchaseAd: (route: string, position: number, size: string): React.ReactElement => (
    <div className="bg-background border-2 border-dashed border-border p-4 text-center hover:border-accent transition-colors cursor-pointer">
      <div className="text-2xl mb-2">📢</div>
      <div className="text-sm font-medium text-foreground mb-1">Ad Space Available</div>
      <div className="text-xs text-muted-foreground mb-3 font-mono">
        {route} • Position {position} • {size}
      </div>
      <button
        className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:bg-accent/90 transition-colors"
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
    <div className="bg-secondary flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading ad...</div>
    </div>
  ),

  createErrorAd: (error: string): React.ReactElement => (
    <div className="bg-destructive/10 border border-destructive/30 flex items-center justify-center">
      <div className="text-destructive text-sm">Failed to load ad: {error}</div>
    </div>
  )
};
