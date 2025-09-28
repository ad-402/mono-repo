'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Ad402Config, Ad402ContextType, Ad402Error } from '../types';

// Create the context
const Ad402Context = createContext<Ad402ContextType | null>(null);

// Provider component
export const Ad402Provider: React.FC<{
  config: Ad402Config;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [error, setError] = useState<Ad402Error | null>(null);

  // Validate configuration
  useEffect(() => {
    if (!config.websiteId) {
      setError({
        code: 'MISSING_WEBSITE_ID',
        message: 'websiteId is required in Ad402Config'
      });
      return;
    }

    if (!config.walletAddress) {
      setError({
        code: 'MISSING_WALLET_ADDRESS',
        message: 'walletAddress is required in Ad402Config'
      });
      return;
    }

    // Basic wallet address validation (Ethereum address format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(config.walletAddress)) {
      setError({
        code: 'INVALID_WALLET_ADDRESS',
        message: 'walletAddress must be a valid Ethereum address (0x...)'
      });
      return;
    }

    // Reset error if config is valid
    setError(null);
  }, [config]);

  // Default configuration values
  const defaultConfig: Ad402Config = {
    apiBaseUrl: 'https://ad402.io',
    theme: {
      primaryColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#e5e5e5',
      fontFamily: 'JetBrains Mono, monospace',
      borderRadius: 0
    },
    payment: {
      networks: ['polygon'],
      defaultNetwork: 'polygon',
      recipientAddress: config.walletAddress // Use the provided wallet address
    },
    ...config
  };

  const contextValue: Ad402ContextType = {
    config: defaultConfig,
    apiBaseUrl: defaultConfig.apiBaseUrl || 'https://ad402.io'
  };

  // If there's a configuration error, show it
  if (error) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c00'
      }}>
        <strong>Ad402 Configuration Error:</strong> {error.message}
      </div>
    );
  }

  return (
    <Ad402Context.Provider value={contextValue}>
      {children}
    </Ad402Context.Provider>
  );
};

// Hook to use the context
export const useAd402Context = (): Ad402ContextType => {
  const context = useContext(Ad402Context);
  
  if (!context) {
    throw new Error('useAd402Context must be used within an Ad402Provider');
  }
  
  return context;
};

// Hook to get configuration
export const useAd402Config = (): Ad402Config => {
  const { config } = useAd402Context();
  return config;
};

// Hook to get API base URL
export const useAd402Api = (): string => {
  const { apiBaseUrl } = useAd402Context();
  return apiBaseUrl;
};
