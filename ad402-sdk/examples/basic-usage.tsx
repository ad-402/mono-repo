// Example: Basic Ad402 SDK Usage
// This example shows how to integrate Ad402 ad slots into a Next.js application

import React from 'react';
import { Ad402Provider, Ad402Slot } from '@ad402/sdk';

// 1. Wrap your app with Ad402Provider
export default function App() {
  return (
    <Ad402Provider
      config={{
        websiteId: 'example-website-123',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Your wallet address to receive payments
        apiBaseUrl: 'https://ad402.io', // Optional, defaults to https://ad402.io
        theme: {
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderColor: '#e5e5e5',
          fontFamily: 'JetBrains Mono, monospace',
          borderRadius: 0
        }
      }}
    >
      <HomePage />
    </Ad402Provider>
  );
}

// 2. Add ad slots to your pages
function HomePage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header>
        <h1>My Awesome Website</h1>
        
        {/* Header banner ad */}
        <Ad402Slot
          slotId="header-banner"
          size="banner"
          price="0.25"
          category="technology"
          onSlotClick={(slotId) => {
            console.log('Header banner clicked:', slotId);
          }}
        />
      </header>

      <main style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <article style={{ flex: 1 }}>
          <h2>Main Content</h2>
          <p>Your main content goes here...</p>
          
          {/* Mid-content square ad */}
          <Ad402Slot
            slotId="mid-content-ad"
            size="square"
            price="0.15"
            category="general"
            style={{ margin: '20px 0' }}
          />
          
          <p>More content...</p>
        </article>

        <aside style={{ width: '200px' }}>
          <h3>Sidebar</h3>
          
          {/* Sidebar ad */}
          <Ad402Slot
            slotId="sidebar-ad"
            size="sidebar"
            price="0.12"
            category="general"
          />
        </aside>
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center' }}>
        {/* Footer banner ad */}
        <Ad402Slot
          slotId="footer-banner"
          size="banner"
          price="0.20"
          category="general"
        />
        
        <p>&copy; 2024 My Awesome Website</p>
      </footer>
    </div>
  );
}

// 3. Custom component with advanced features
function AdvancedAdSlot() {
  return (
    <Ad402Slot
      slotId="advanced-slot"
      size="banner"
      price="0.30"
      category="technology"
      durations={['1h', '6h', '24h', '7d']}
      clickable={true}
      onAdLoad={(adData) => {
        console.log('Ad loaded successfully:', adData);
      }}
      onAdError={(error) => {
        console.error('Ad failed to load:', error);
      }}
      loadingComponent={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f5f5f5'
        }}>
          Loading ad...
        </div>
      }
      errorComponent={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#fee',
          color: '#c00',
          textAlign: 'center',
          padding: '10px'
        }}>
          Ad temporarily unavailable
        </div>
      }
      emptySlotComponent={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          cursor: 'pointer'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Ad Space Available</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Click to purchase</div>
        </div>
      }
    />
  );
}
