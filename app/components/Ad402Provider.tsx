'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

interface Ad402ProviderProps {
  publisherWallet: string;
  network?: string;
  currency?: string;
  apiBaseUrl?: string;
  children: React.ReactNode;
}

export const Ad402Provider: React.FC<Ad402ProviderProps> = ({
  publisherWallet,
  network = 'base',
  currency = 'USDC',
  apiBaseUrl = '/api',
  children
}) => {
  useEffect(() => {
    const initAd402 = () => {
      if ((window as any).Ad402) {
        (window as any).Ad402.init({
          publisherWallet,
          network,
          currency,
          apiBaseUrl
        });
      }
    };

    if ((window as any).Ad402) {
      initAd402();
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).Ad402) {
          initAd402();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [publisherWallet, network, currency, apiBaseUrl]);

  return (
    <>
      <Script
        src="/js/ad402-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Ad402 SDK loaded');
        }}
      />
      {children}
    </>
  );
};