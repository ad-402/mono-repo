'use client';

import React, { useState, useEffect } from 'react';
import { Ad402Slot } from '@/components/Ad402Slot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdSlot {
  id: string;
  slotIdentifier: string;
  size: string;
  width: number;
  height: number;
  basePrice: string;
  durationOptions: string[];
  category?: string;
  websiteUrl: string;
  publisher: {
    walletAddress: string;
    websiteDomain?: string;
  };
}

export default function TestAdsPage() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch('/api/ad-slots');
        if (response.ok) {
          const data = await response.json();
          setSlots(data);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const createTestSlot = async () => {
    try {
      const response = await fetch('/api/ad-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publisherWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          slotIdentifier: `test-slot-${Date.now()}`,
          size: 'banner',
          basePrice: '0.10',
          durationOptions: ['30m', '1h', '6h', '24h'],
          category: 'test',
          websiteUrl: 'https://example.com'
        })
      });

      if (response.ok) {
        const newSlot = await response.json();
        setSlots(prev => [...prev, newSlot]);
      }
    } catch (error) {
      console.error('Error creating test slot:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ad slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Ad Slots</h1>
          <p className="text-gray-600 mt-2">
            Click on any ad slot to place a bid and test the x402 payment flow
          </p>
          <Button 
            onClick={createTestSlot}
            className="mt-4"
            variant="outline"
          >
            Create Test Slot
          </Button>
        </div>

        {slots.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Ad Slots Found</CardTitle>
              <CardDescription>
                Create a test slot to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestSlot}>
                Create Your First Test Slot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{slot.slotIdentifier}</CardTitle>
                  <CardDescription>
                    {slot.publisher.websiteDomain || 'Unknown website'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Size:</span>
                      <span>{slot.size} ({slot.width}x{slot.height})</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold">${slot.basePrice} USDC</span>
                    </div>
                    {slot.category && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span>{slot.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Ad402Slot
                      slotId={slot.id}
                      size={slot.size as any}
                      price={slot.basePrice}
                      durations={slot.durationOptions}
                      category={slot.category}
                      clickable={true}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Click the slot above to place a bid
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
