'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Ad402SlotProps {
  slotId: string;
  size?: 'banner' | 'square' | 'sidebar' | 'leaderboard' | 'mobile' | 'card';
  price?: string;
  durations?: string[];
  category?: string;
  className?: string;
  autoRegister?: boolean;
  clickable?: boolean;
}

export const Ad402Slot: React.FC<Ad402SlotProps> = ({
  slotId,
  size = 'banner',
  price = '0.10',
  durations = ['30m', '1h', '6h', '24h'],
  category,
  className = '',
  autoRegister = false,
  clickable = true
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (slotRef.current) {
      slotRef.current.setAttribute('data-slot-id', slotId);
      slotRef.current.setAttribute('data-size', size);
      slotRef.current.setAttribute('data-price', price);
      slotRef.current.setAttribute('data-durations', durations.join(','));
      
      if (category) {
        slotRef.current.setAttribute('data-category', category);
      }
      
      // Disable auto-registration to prevent Ad402 SDK modal conflicts
      slotRef.current.setAttribute('data-register', 'false');
    }
  }, [slotId, size, price, durations, category, autoRegister]);

  const handleSlotClick = () => {
    if (clickable) {
      router.push(`/ads/${slotId}`);
    }
  };

  const dimensions = getDimensions(size);

  return (
    <div
      ref={slotRef}
      className={`ad402-slot ${className} ${clickable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
      data-slot-id={slotId}
      data-size={size}
      data-price={price}
      data-durations={durations.join(',')}
      data-category={category}
      data-register="false"
      onClick={handleSlotClick}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        border: '2px dashed #ddd',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9'
      }}
    >
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
        <div>Loading ad slot...</div>
        {clickable && (
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#999' }}>
            Click to place bid
          </div>
        )}
      </div>
    </div>
  );
};

function getDimensions(size: string) {
  const dimensions = {
    banner: { width: 728, height: 90 },
    leaderboard: { width: 728, height: 90 },
    square: { width: 300, height: 250 },
    sidebar: { width: 160, height: 600 },
    mobile: { width: 320, height: 50 },
    card: { width: 300, height: 200 }
  };
  return dimensions[size as keyof typeof dimensions] || dimensions.banner;
}