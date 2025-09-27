// app/example-ads/page.tsx
'use client';

import { AdSlot } from '@/components/AdSlot';

export default function ExampleAdsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ad Display Examples</h1>
      
      {/* Header banner ad */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Header Banner Ad</h2>
        <AdSlot 
          route="/example-ads" 
          position={0} 
          size="banner"
          className="mx-auto"
        />
      </div>
      
      <div className="flex gap-8">
        <main className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Main Content</h2>
          <p className="mb-4">
            This is your main content area. Ads will appear in the designated slots.
            If no one has paid for the ad space, you'll see a "Purchase Ad Space" button.
          </p>
          
          {/* Square ad in content */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Content Square Ad</h3>
            <AdSlot 
              route="/example-ads" 
              position={1} 
              size="square"
            />
          </div>
          
          <p className="mb-4">
            More content here. The ad system automatically checks for valid payments
            and displays the appropriate content.
          </p>
        </main>
        
        <aside className="w-64">
          <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
          
          {/* Sidebar ad */}
          <div className="mb-6">
            <AdSlot 
              route="/example-ads" 
              position={2} 
              size="sidebar"
              fallbackContent={
                <div className="bg-blue-50 p-4 rounded text-center">
                  <p className="text-blue-600 font-medium">Custom Fallback</p>
                  <p className="text-blue-500 text-sm mt-1">This is a custom fallback for this specific slot</p>
                </div>
              }
            />
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium mb-2">Sidebar Content</h3>
            <p className="text-sm text-gray-600">
              This is regular sidebar content. The ad above will show either a paid ad
              or the custom fallback content.
            </p>
          </div>
        </aside>
      </div>
      
      {/* Mobile ad example */}
      <div className="mt-8 md:hidden">
        <h2 className="text-xl font-semibold mb-4">Mobile Ad</h2>
        <AdSlot 
          route="/example-ads" 
          position={3} 
          size="mobile"
        />
      </div>
      
      {/* Footer banner */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Footer Banner</h2>
        <AdSlot 
          route="/example-ads" 
          position={4} 
          size="banner"
          className="mx-auto"
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Each ad slot has a unique identifier: route + position + size</li>
          <li>• The system checks your hash service for valid payments</li>
          <li>• If payment exists and hasn't expired, it shows the ad from IPFS</li>
          <li>• If no payment, it shows fallback content (purchase button)</li>
          <li>• All ad views and clicks are tracked for analytics</li>
        </ul>
      </div>
    </div>
  );
}
