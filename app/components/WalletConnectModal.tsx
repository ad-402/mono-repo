'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Simple SVG icons
const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string, chainId: number) => void;
  onDisconnect?: () => void;
}

export default function WalletConnectModal({ isOpen, onClose, onConnect, onDisconnect }: WalletConnectModalProps) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address && chainId) {
      onConnect?.(address, chainId);
    }
  }, [isConnected, address, chainId, onConnect]);

  const handleDisconnect = () => {
    disconnect();
    onDisconnect?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connect Wallet</CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Connect your wallet to interact with the Ad402 platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-3">
              <ConnectButton />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Wallet Connected</p>
                    <p className="text-sm text-green-600 font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="sm"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              {chainId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <span className="font-semibold">Network:</span> Chain {chainId}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={onClose}
                  className="w-full"
                >
                  Continue
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
