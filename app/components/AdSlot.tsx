// components/AdSlot.tsx
import React, { useState, useEffect } from 'react';
import { AdService } from '@/lib/adService';
import { AdAnalytics } from '@/lib/adAnalytics';
import { AdFallbacks } from '@/lib/adFallbacks';

interface AdSlotProps {
  route: string;
  position: number;
  size: 'banner' | 'sidebar' | 'square' | 'mobile';
  fallbackContent?: React.ReactNode;
  className?: string;
  onAdLoad?: (hasAd: boolean) => void;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  route,
  position,
  size,
  fallbackContent,
  className = '',
  onAdLoad
}) => {
  const [adContent, setAdContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if slot has valid payment
        const paymentRecord = await AdService.checkAdPayment({
          route,
          position,
          size
        });

        if (paymentRecord && paymentRecord.media_hash) {
          // Get content URL from IPFS
          const contentUrl = AdService.getContentUrl(paymentRecord.media_hash);
          setAdContent(contentUrl);
          onAdLoad?.(true);
          
          // Track ad view
          const slotIndex = AdService.generateSlotIndex(route, position, size);
          AdAnalytics.trackAdView(slotIndex, paymentRecord.media_hash);
        } else {
          // No valid payment found
          setAdContent(null);
          onAdLoad?.(false);
        }
      } catch (err) {
        console.error('Failed to load ad:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
        setError(errorMessage);
        onAdLoad?.(false);
        
        // Track ad error
        const slotIndex = AdService.generateSlotIndex(route, position, size);
        AdAnalytics.trackAdError(slotIndex, errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadAd();
  }, [route, position, size, onAdLoad]);

  // Get dimensions based on ad size
  const getDimensions = (size: string) => {
    const dimensions = {
      banner: { width: '728px', height: '90px' },
      sidebar: { width: '160px', height: '600px' },
      square: { width: '300px', height: '250px' },
      mobile: { width: '320px', height: '50px' }
    };
    return dimensions[size as keyof typeof dimensions] || dimensions.banner;
  };

  const { width, height } = getDimensions(size);

  if (isLoading) {
    return (
      <div 
        className={`ad-slot loading ${className}`}
        style={{ width, height }}
      >
        {AdFallbacks.createLoadingAd()}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`ad-slot error ${className}`}
        style={{ width, height }}
      >
        {AdFallbacks.createErrorAd(error)}
      </div>
    );
  }

  if (adContent) {
    return (
      <div 
        className={`ad-slot paid ${className}`}
        style={{ width, height }}
      >
        <img
          src={adContent}
          alt="Advertisement"
          className="w-full h-full object-cover rounded cursor-pointer"
          onError={() => {
            setError('Failed to load ad image');
            setAdContent(null);
          }}
          onLoad={() => {
            console.log(`Ad loaded successfully for ${route}:${position}`);
          }}
          onClick={() => {
            // Track ad click
            const slotIndex = AdService.generateSlotIndex(route, position, size);
            AdAnalytics.trackAdClick(slotIndex, adContent);
          }}
        />
      </div>
    );
  }

  // Show fallback content for unpaid slots
  return (
    <div 
      className={`ad-slot fallback ${className}`}
      style={{ width, height }}
    >
      {fallbackContent || AdFallbacks.createPurchaseAd(route, position, size)}
    </div>
  );
};
