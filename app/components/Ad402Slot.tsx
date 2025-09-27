// 3. components/Ad402Slot.tsx
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
  clickable?: boolean;
}

export const Ad402Slot: React.FC<Ad402SlotProps> = ({
  slotId,
  size = 'banner',
  price = '0.10',
  durations = ['30m', '1h', '6h', '24h'],
  category = 'general',
  className = '',
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
      slotRef.current.setAttribute('data-category', category);
    }
  }, [slotId, size, price, durations, category]);

  const handleSlotClick = () => {
    if (clickable) {
      const params = new URLSearchParams({
        slotId,
        price,
        size,
        durations: durations.join(','),
        category
      });
      router.push(`/checkout?${params.toString()}`);
    }
  };

  const dimensions = getDimensions(size);
  const fontSizes = getOptimalFontSizes(dimensions);

  return (
    <div
      ref={slotRef}
      className={`ad402-slot ${className} ${clickable ? 'cursor-pointer hover:bg-secondary transition-colors' : ''}`}
      onClick={handleSlotClick}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        maxHeight: '100%',
        border: '2px dashed hsl(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(var(--background))',
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <div
        style={{ 
          textAlign: 'center', 
          color: 'hsl(var(--foreground))',
          fontFamily: 'JetBrains Mono, monospace',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <div style={{ fontSize: fontSizes.icon, marginBottom: '2px', lineHeight: '1' }}>💳</div>
        <div style={{ fontSize: fontSizes.title, fontWeight: '600', marginBottom: '1px', lineHeight: '1.1' }}>
          Ad Slot: {slotId}
        </div>
        <div style={{ fontSize: fontSizes.subtitle, marginBottom: '1px', lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
          {price} USDC • {size}
        </div>
        <div style={{ fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
          Polygon USDC
        </div>
        {clickable && (
          <div style={{ fontSize: fontSizes.small, lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
            Click to purchase
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
    mobile: { width: 320, height: 60 }, // Increased height for better content fit
    card: { width: 300, height: 220 } // Increased height for better content fit
  };
  return dimensions[size as keyof typeof dimensions] || dimensions.banner;
}

function getOptimalFontSizes(dimensions: { width: number; height: number }) {
  const { width, height } = dimensions;
  const area = width * height;
  
  // Calculate font sizes based on slot dimensions
  const baseSize = Math.min(width, height) * 0.08; // 8% of smallest dimension
  
  return {
    icon: `${Math.max(12, Math.min(24, baseSize * 1.5))}px`,
    title: `${Math.max(8, Math.min(14, baseSize))}px`,
    subtitle: `${Math.max(7, Math.min(12, baseSize * 0.8))}px`,
    small: `${Math.max(6, Math.min(10, baseSize * 0.7))}px`
  };
}

// 4. utils/usdcService.ts
export interface USDCConfig {
  address: string;
  name: string;
  decimals: number;
  version: string;
}

export interface PaymentSignatureData {
  signature: string;
  domain: any;
  types: any;
  message: any;
  userAddress: string;
  paymentInfo: any;
  usdcConfig: USDCConfig;
  chainId: number;
}

// USDC contract configurations
export const USDC_CONTRACTS = {
  "137": {
    address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    name: "USD Coin",
    decimals: 6,
    version: "2"
  },
  "80002": {
    address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", 
    name: "USDC",
    decimals: 6,
    version: "2"
  }
} as const;

export class USDCService {
  /**
   * Get USDC configuration for a specific chain
   */
  static getUSDCConfig(chainId: number): USDCConfig | null {
    const config = USDC_CONTRACTS[chainId.toString() as keyof typeof USDC_CONTRACTS];
    return config || null;
  }

  /**
   * Check if chain is supported
   */
  static isSupportedChain(chainId: number): boolean {
    return chainId === 137 || chainId === 80002; // Polygon Mainnet or Amoy
  }

  /**
   * Generate EIP-3009 transferWithAuthorization signature
   */
  static async generateEIP3009Signature(
    walletClient: any,
    userAddress: string,
    recipient: string,
    amount: string,
    chainId: number
  ): Promise<PaymentSignatureData> {
    const usdcConfig = this.getUSDCConfig(chainId);
    
    if (!usdcConfig) {
      throw new Error(`Unsupported network. Chain ID: ${chainId}`);
    }

    // EIP-712 domain with correct USDC details
    const domain = {
      name: usdcConfig.name,
      version: usdcConfig.version,
      chainId,
      verifyingContract: usdcConfig.address
    };

    // EIP-3009 types
    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };

    // Generate random nonce
    const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Convert amount to wei (6 decimals for USDC)
    const value = (parseFloat(amount) * Math.pow(10, usdcConfig.decimals)).toString();
    
    // Time validity
    const currentTime = Math.floor(Date.now() / 1000);
    const validAfter = 0;
    const validBefore = currentTime + 3600; // Valid for 1 hour

    // Message to sign
    const message = {
      from: userAddress,
      to: recipient,
      value,
      validAfter,
      validBefore,
      nonce
    };

    // Sign the message
    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message
    });

    return {
      signature,
      domain,
      types,
      message,
      userAddress,
      paymentInfo: { amount, recipient },
      usdcConfig,
      chainId
    };
  }

  /**
   * Send signed data to x402 endpoint
   */
  static async sendToX402(
    endpoint: string,
    signatureData: PaymentSignatureData,
    additionalData: any = {}
  ): Promise<any> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signatureData.signature}`
      },
      body: JSON.stringify({
        signature: signatureData.signature,
        signatureData,
        ...additionalData,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Format address for display
   */
  static formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Get network name from chain ID
   */
  static getNetworkName(chainId: number): string {
    switch (chainId) {
      case 137:
        return 'Polygon Mainnet';
      case 80002:
        return 'Polygon Amoy';
      default:
        return `Chain ${chainId}`;
    }
  }
}
