'use client';

import React from 'react';
import { Ad402Slot } from '@/components/Ad402Slot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExampleAdsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold text-foreground mb-2">
            Ad Slot Examples
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            See how ad slots look with and without ads
          </p>
        </div>

        {/* Available Slots Section */}
        <div className="mb-12">
          <h2 className="text-xl font-mono font-semibold text-foreground mb-4">
            Available Ad Slots (Click to Purchase)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Banner Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  728x90 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="banner-001"
                  size="banner"
                  price="0.10"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Square Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  300x250 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="square-001"
                  size="square"
                  price="0.15"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Mobile Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  320x60 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="mobile-001"
                  size="mobile"
                  price="0.08"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Sidebar Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  160x600 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="sidebar-001"
                  size="sidebar"
                  price="0.12"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Card Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  300x220 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="card-001"
                  size="card"
                  price="0.20"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Leaderboard Ad</CardTitle>
                <CardDescription className="font-mono text-xs">
                  728x90 pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Ad402Slot
                  slotId="leaderboard-001"
                  size="leaderboard"
                  price="0.18"
                  durations={['30m', '1h', '6h', '24h']}
                  category="general"
                  clickable={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-8">
          <h2 className="text-xl font-mono font-semibold text-foreground mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">1. Purchase Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Click on any available ad slot to purchase it with USDC on Polygon network.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">2. Upload Ad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  After payment, upload your ad image. It will be stored on IPFS for decentralized access.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">3. Ad Goes Live</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Your ad will be displayed in the slot until the purchased duration expires.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-xl font-mono font-semibold text-foreground mb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Decentralized Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Ads are stored on IPFS (InterPlanetary File System) for censorship-resistant, decentralized access.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Blockchain Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Secure payments using USDC on Polygon network with transparent transaction records.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Multiple Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Support for various ad formats: banner, square, mobile, sidebar, card, and leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Flexible Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">
                  Choose from multiple duration options: 30 minutes, 1 hour, 6 hours, or 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}