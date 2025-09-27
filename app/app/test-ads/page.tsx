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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-mono">Loading ad slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold text-foreground">Test Ad Slots</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Click on any ad slot to place a bid and test the payment flow
          </p>
          <Button 
            onClick={createTestSlot}
            className="mt-4 font-mono"
            variant="outline"
          >
            Create Test Slot
          </Button>
        </div>

        {slots.length === 0 ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-mono">No Ad Slots Found</CardTitle>
              <CardDescription className="font-mono">
                Create a test slot to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestSlot} className="font-mono">
                Create Your First Test Slot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot.id} className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-mono">{slot.slotIdentifier}</CardTitle>
                  <CardDescription className="font-mono">
                    {slot.publisher.websiteDomain || 'Unknown website'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="text-foreground">{slot.size} ({slot.width}x{slot.height})</span>
                    </div>
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-foreground">${slot.basePrice} USDC</span>
                    </div>
                    {slot.category && (
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="text-foreground">{slot.category}</span>
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
                  
                  <div className="text-xs text-muted-foreground font-mono">
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
