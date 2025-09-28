'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ad402SlotProps, AdData, QueueInfo, Ad402Error } from '../types';
import { useAd402Context } from './Ad402Provider';

// Default slot dimensions
const SLOT_DIMENSIONS = {
  banner: { width: 728, height: 90 },
  square: { width: 300, height: 250 },
  mobile: { width: 320, height: 60 },
  sidebar: { width: 160, height: 600 }
};

// Default font sizes based on slot dimensions
const getOptimalFontSizes = (width: number, height: number) => {
  const baseSize = Math.min(width, height);
  return {
    icon: Math.max(12, baseSize * 0.08),
    title: Math.max(10, baseSize * 0.06),
    subtitle: Math.max(8, baseSize * 0.05),
    small: Math.max(6, baseSize * 0.04)
  };
};

// Default loading component
const DefaultLoadingComponent: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Default error component
const DefaultErrorComponent: React.FC<{ error: Ad402Error }> = ({ error }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '10px',
    color: '#c00',
    textAlign: 'center',
    padding: '8px'
  }}>
    Error: {error.message}
  </div>
);

// Default empty slot component
const DefaultEmptySlotComponent: React.FC<{
  slotId: string;
  price: string;
  size: string;
  queueInfo: QueueInfo | null;
  onClick: () => void;
  clickable: boolean;
  theme: any;
}> = ({ slotId, price, size, queueInfo, onClick, clickable, theme }) => {
  const dimensions = SLOT_DIMENSIONS[size as keyof typeof SLOT_DIMENSIONS];
  const fontSizes = getOptimalFontSizes(dimensions.width, dimensions.height);

  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: '100%',
        height: '100%',
        border: `2px dashed ${theme.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.backgroundColor,
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
        fontFamily: theme.fontFamily,
        color: theme.textColor,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = theme.backgroundColor;
        }
      }}
    >
      <div style={{ fontSize: fontSizes.icon, marginBottom: '2px', lineHeight: '1' }}>💳</div>
      <div style={{ fontSize: fontSizes.title, fontWeight: '600', marginBottom: '1px', lineHeight: '1.1' }}>
        Ad Slot: {slotId}
      </div>
      <div style={{ fontSize: fontSizes.subtitle, marginBottom: '1px', lineHeight: '1.1', color: '#666' }}>
        {price} USDC • {size}
      </div>
      {queueInfo && !queueInfo.isAvailable && (
        <div style={{ fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: theme.primaryColor, fontWeight: 'bold' }}>
          {queueInfo.totalInQueue} in queue
        </div>
      )}
      <div style={{ fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: '#666' }}>
        Polygon USDC
      </div>
      {clickable && (
        <div style={{ fontSize: fontSizes.small, lineHeight: '1.1', color: '#666' }}>
          {queueInfo && !queueInfo.isAvailable ? 'Click to bid' : 'Click to purchase'}
        </div>
      )}
    </div>
  );
};

export const Ad402Slot: React.FC<Ad402SlotProps> = ({
  slotId,
  size = 'banner',
  price = '0.10',
  durations = ['30m', '1h', '6h', '24h'],
  category = 'general',
  className = '',
  clickable = true,
  dimensions: customDimensions,
  onSlotClick,
  onAdLoad,
  onAdError,
  loadingComponent,
  errorComponent,
  emptySlotComponent,
  ...props
}) => {
  const { config, apiBaseUrl } = useAd402Context();
  const [adData, setAdData] = useState<AdData | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Ad402Error | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  // Get slot dimensions
  const slotDimensions = customDimensions || SLOT_DIMENSIONS[size as keyof typeof SLOT_DIMENSIONS];
  const fontSizes = getOptimalFontSizes(slotDimensions.width, slotDimensions.height);

  // Fetch ad data
  const fetchAdData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/ads/${slotId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ad data: ${response.status}`);
      }

      const data = await response.json();
      setAdData(data);
      
      if (data.hasAd && onAdLoad) {
        onAdLoad(data);
      }
    } catch (err) {
      const error: Ad402Error = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch ad data',
        details: err
      };
      setError(error);
      if (onAdError) {
        onAdError(err instanceof Error ? err : new Error('Failed to fetch ad data'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, slotId, onAdLoad, onAdError]);

  // Fetch queue info
  const fetchQueueInfo = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/queue-info/${slotId}`);
      if (response.ok) {
        const data = await response.json();
        setQueueInfo(data);
      }
    } catch (err) {
      console.warn('Failed to fetch queue info:', err);
    }
  }, [apiBaseUrl, slotId]);

  // Handle slot click
  const handleSlotClick = useCallback(() => {
    if (onSlotClick) {
      onSlotClick(slotId);
    } else {
      // Default behavior: redirect to checkout
      const params = new URLSearchParams({
        slotId,
        price,
        size,
        durations: durations.join(','),
        category,
        websiteId: config.websiteId,
        walletAddress: config.walletAddress
      });
      window.open(`${apiBaseUrl}/checkout?${params.toString()}`, '_blank');
    }
  }, [onSlotClick, slotId, price, size, durations, category, config.websiteId, config.walletAddress, apiBaseUrl]);

  // Initial data fetch
  useEffect(() => {
    fetchAdData();
    fetchQueueInfo();
  }, [fetchAdData, fetchQueueInfo]);

  // Set slot attributes for external tracking
  useEffect(() => {
    if (slotRef.current) {
      slotRef.current.setAttribute('data-slot-id', slotId);
      slotRef.current.setAttribute('data-size', size);
      slotRef.current.setAttribute('data-price', price);
      slotRef.current.setAttribute('data-durations', durations.join(','));
      slotRef.current.setAttribute('data-category', category);
      slotRef.current.setAttribute('data-website-id', config.websiteId);
    }
  }, [slotId, size, price, durations, category, config.websiteId]);

  // Loading state
  if (isLoading) {
    return (
      <div
        ref={slotRef}
        className={`ad402-slot ${className}`}
        style={{
          width: slotDimensions.width,
          height: slotDimensions.height,
          maxWidth: '100%',
          maxHeight: '100%',
          border: `2px solid ${config.theme?.borderColor}`,
          backgroundColor: config.theme?.backgroundColor,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {loadingComponent || <DefaultLoadingComponent />}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        ref={slotRef}
        className={`ad402-slot ${className}`}
        style={{
          width: slotDimensions.width,
          height: slotDimensions.height,
          maxWidth: '100%',
          maxHeight: '100%',
          border: `2px solid ${config.theme?.borderColor}`,
          backgroundColor: config.theme?.backgroundColor,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {errorComponent || <DefaultErrorComponent error={error} />}
      </div>
    );
  }

  // Ad exists - show the ad
  if (adData?.hasAd && adData.contentUrl) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          ref={slotRef}
          className={`ad402-slot ${className}`}
          style={{
            width: slotDimensions.width,
            height: slotDimensions.height,
            maxWidth: '100%',
            maxHeight: '100%',
            border: `2px solid ${config.theme?.borderColor}`,
            backgroundColor: config.theme?.backgroundColor,
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
            margin: '0 auto'
          }}
        >
          <img
            src={adData.contentUrl}
            alt="Advertisement"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
            onClick={() => {
              // Track ad click if needed
              console.log(`Ad clicked: ${slotId}`);
            }}
            onError={() => {
              // If image fails to load, fall back to empty slot
              setAdData({ hasAd: false });
            }}
          />
        </div>
        
        {/* Book Next Slot Button */}
        {clickable && (
          <button
            onClick={handleSlotClick}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              minWidth: '24px',
              height: '24px',
              backgroundColor: config.theme?.primaryColor,
              color: config.theme?.backgroundColor,
              border: 'none',
              borderRadius: config.theme?.borderRadius || 0,
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: config.theme?.fontFamily,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              zIndex: 10,
              padding: queueInfo && queueInfo.totalInQueue > 0 ? '0 6px' : '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${config.theme?.primaryColor || '#000000'}dd`;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = config.theme?.primaryColor || '#000000';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={queueInfo && queueInfo.totalInQueue > 0 
              ? `Book next slot (${queueInfo.totalInQueue} in queue)` 
              : "Book next slot"
            }
          >
            {queueInfo && queueInfo.totalInQueue > 0 ? queueInfo.totalInQueue : '+'}
          </button>
        )}
      </div>
    );
  }

  // Empty slot - show purchase option
  return (
    <div
      ref={slotRef}
      className={`ad402-slot ${className}`}
      style={{
        width: slotDimensions.width,
        height: slotDimensions.height,
        maxWidth: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      {emptySlotComponent || (
        <DefaultEmptySlotComponent
          slotId={slotId}
          price={price}
          size={size}
          queueInfo={queueInfo}
          onClick={handleSlotClick}
          clickable={clickable}
          theme={config.theme || {}}
        />
      )}
    </div>
  );
};
