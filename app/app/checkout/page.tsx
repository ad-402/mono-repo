// pages/checkout/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

interface ConnectionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

interface PaymentInfo {
  slotId: string;
  price: string;
  size: string;
  durations: string[];
  category: string;
}

// USDC contract addresses and details
const USDC_CONFIG = {
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

// X402 endpoint - replace with your actual endpoint
const X402_ENDPOINT = 'https://polygon-facilitator.vercel.app';

// Payment recipient address
const PAYMENT_RECIPIENT = '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ type: 'idle', message: '' });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  // Parse payment information from URL parameters
  useEffect(() => {
    const slotId = searchParams.get('slotId');
    const price = searchParams.get('price');
    const size = searchParams.get('size');
    const durations = searchParams.get('durations')?.split(',') || [];
    const category = searchParams.get('category') || 'general';

    if (slotId && price && size) {
      setPaymentInfo({
        slotId,
        price,
        size,
        durations,
        category
      });
    }
  }, [searchParams]);

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
    setConnectionStatus({ type: 'idle', message: '' });
  };

  // Check if user is on supported network
  const isSupportedNetwork = () => {
    return chainId === 80002 || chainId === 137; // Polygon Amoy or Polygon Mainnet
  };

  const getNetworkName = (chainId?: number) => {
    if (chainId === 80002) return 'Polygon Amoy';
    if (chainId === 137) return 'Polygon Mainnet';
    return `Chain ${chainId}`;
  };

  // Generate EIP-3009 signature and settle payment
  const handleSignAndPay = async () => {
    if (!address || !paymentInfo || !walletClient || !chainId) return;
    
    // Check if on supported network
    if (!isSupportedNetwork()) {
      setConnectionStatus({ 
        type: 'error', 
        message: 'Please switch to Polygon network' 
      });
      return;
    }
    
    try {
      setConnectionStatus({ type: 'loading', message: 'Preparing payment...' });
      
      // Generate EIP-3009 signature
      const signatureData = await generateEIP3009Signature(
        walletClient,
        address,
        paymentInfo,
        chainId
      );
      
      setConnectionStatus({ type: 'loading', message: 'Processing payment...' });
      
      // Create x402 PaymentPayload and PaymentRequirements
      const x402Network = chainId === 137 ? 'polygon' : 'polygon-amoy';
      
      const paymentPayload = {
        x402Version: 1,
        scheme: 'exact',
        network: x402Network,
        payload: {
          signature: signatureData.signature,
          authorization: {
            from: address,
            to: PAYMENT_RECIPIENT,
            value: (parseFloat(paymentInfo.price) * Math.pow(10, signatureData.usdcConfig.decimals)).toString(),
            validAfter: signatureData.message.validAfter.toString(),
            validBefore: signatureData.message.validBefore.toString(),
            nonce: signatureData.message.nonce
          }
        }
      };

      const paymentRequirements = {
        scheme: 'exact',
        network: x402Network,
        payTo: PAYMENT_RECIPIENT,
        maxAmountRequired: (parseFloat(paymentInfo.price) * Math.pow(10, signatureData.usdcConfig.decimals)).toString(),
        maxTimeoutSeconds: 3600,
        asset: signatureData.usdcConfig.address,
        resource: `https://ad402.io/slot/${paymentInfo.slotId}`,
        description: `Ad slot purchase: ${paymentInfo.slotId}`,
        mimeType: 'application/json'
      };
      
      // Send to x402 settle endpoint
      const settlementResponse = await fetch(`${X402_ENDPOINT}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements
        })
      });
      
      const settlementResult = await settlementResponse.json();
      
      console.log('Settlement result:', settlementResult);
      
      if (!settlementResponse.ok) {
        throw new Error(settlementResult.error || 'Payment settlement failed');
      }

      setConnectionStatus({ 
        type: 'success', 
        message: `Payment successful! Redirecting...` 
      });

      // Prepare payment data for upload page
      const paymentData = {
        index: paymentInfo.slotId,
        validUpto: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        txHash: settlementResult.transactionHash || settlementResult.hash,
        AmountPaid: (parseFloat(paymentInfo.price) * Math.pow(10, signatureData.usdcConfig.decimals)).toString(),
        payerAddress: address,
        recieverAddress: PAYMENT_RECIPIENT
      };

      // Store payment data in session storage for the upload page
      sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
      sessionStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
      
      // Send success message to parent window with payment data
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'PAYMENT_SUCCESS',
          signature: signatureData.signature,
          paymentInfo,
          chainId,
          transactionHash: settlementResult.transactionHash,
          paymentData,
          redirectTo: '/upload'
        }, '*');
      } else {
        // If not in iframe, redirect directly with parameters
        setTimeout(() => {
          const uploadParams = new URLSearchParams({
            slotId: paymentInfo.slotId,
            price: paymentInfo.price,
            size: paymentInfo.size,
            category: paymentInfo.category,
            transactionHash: settlementResult.transactionHash || settlementResult.hash || '',
            walletAddress: address || '',
            network: getNetworkName(chainId)
          });
          router.push(`/upload?${uploadParams.toString()}`);
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      setConnectionStatus({ 
        type: 'error', 
        message: 'Payment failed. Please try again.' 
      });
      
      // Send error message to parent window if in iframe
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'PAYMENT_ERROR',
          error: error.message
        }, '*');
      }
    }
  };

  // Generate EIP-3009 transferWithAuthorization signature
  const generateEIP3009Signature = async (
    walletClient: any, 
    userAddress: string, 
    paymentInfo: PaymentInfo, 
    chainId: number
  ) => {
    const usdcConfig = USDC_CONFIG[chainId.toString() as keyof typeof USDC_CONFIG];
    
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
    const value = (parseFloat(paymentInfo.price) * Math.pow(10, usdcConfig.decimals)).toString();
    
    // Time validity
    const currentTime = Math.floor(Date.now() / 1000);
    const validAfter = 0;
    const validBefore = currentTime + 3600; // Valid for 1 hour

    // Message to sign
    const message = {
      from: userAddress,
      to: PAYMENT_RECIPIENT,
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
      paymentInfo,
      usdcConfig,
      chainId
    };
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Render connection status
  const renderConnectionStatus = () => {
    if (connectionStatus.type === 'idle') return null;

    const statusClasses = {
      loading: 'bg-secondary border-border text-foreground',
      success: 'bg-secondary border-border text-foreground',
      error: 'bg-secondary border-border text-foreground'
    };

    const icons = {
      loading: <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent" />,
      success: <CheckCircleIcon className="w-5 h-5" />,
      error: <ExclamationTriangleIcon className="w-5 h-5" />
    };

    return (
      <div className={`${statusClasses[connectionStatus.type]} border px-4 py-3 flex items-center gap-3 font-mono`}>
        {icons[connectionStatus.type]}
        <span>{connectionStatus.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-6 font-mono"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-mono font-bold text-foreground mb-2">
            Purchase Ad Slot
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Complete your payment to secure this ad slot
          </p>
        </div>

        {/* Payment Information Card */}
        {paymentInfo && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-mono font-bold text-foreground mb-1">
                  {paymentInfo.price} USDC
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {paymentInfo.slotId} • {paymentInfo.size}
                </div>
              </div>
              
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slot:</span>
                  <span className="text-foreground">{paymentInfo.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">{paymentInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-foreground">Polygon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Connection Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {!isConnected ? (
              <div className="text-center">
                <WalletIcon className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 font-mono text-sm">
                  Connect your wallet to continue
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-foreground" />
                    <div>
                      <p className="font-mono font-medium text-foreground text-sm">Wallet Connected</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(address || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                {chainId && !isSupportedNetwork() && (
                  <div className="p-3 bg-secondary border border-border">
                    <p className="text-sm font-mono text-muted-foreground">
                      ⚠️ Please switch to Polygon network
                    </p>
                  </div>
                )}

                {/* Payment Button */}
                {paymentInfo && (
                  <div className="space-y-4">
                    <Button
                      onClick={handleSignAndPay}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-12"
                      disabled={connectionStatus.type === 'loading' || !isSupportedNetwork()}
                    >
                      {connectionStatus.type === 'loading' ? 'Processing...' : `Pay ${paymentInfo.price} USDC`}
                    </Button>
                    
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full font-mono"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        {renderConnectionStatus()}
      </div>
    </div>
  );
}