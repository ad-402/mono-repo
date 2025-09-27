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

  // Generate EIP-3009 signature and send to x402
  const handleSignAndPay = async () => {
    if (!address || !paymentInfo || !walletClient || !chainId) return;
    
    // Check if on supported network
    if (!isSupportedNetwork()) {
      setConnectionStatus({ 
        type: 'error', 
        message: 'Please switch to Polygon Amoy (Chain ID: 80002) or Polygon Mainnet (Chain ID: 137)' 
      });
      return;
    }
    
    try {
      setConnectionStatus({ type: 'loading', message: 'Generating signature...' });
      
      // Generate EIP-3009 signature
      const signatureData = await generateEIP3009Signature(
        walletClient,
        address,
        paymentInfo,
        chainId
      );
      
      setConnectionStatus({ type: 'loading', message: 'Sending to x402 settle endpoint...' });
      
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
      const response = await fetch(`${X402_ENDPOINT}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setConnectionStatus({ 
          type: 'success', 
          message: `Payment settled successfully! TX: ${result.transactionHash || 'completed'}` 
        });
        
        // Send success message to parent window if in iframe
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'PAYMENT_SUCCESS',
            signature: signatureData.signature,
            paymentInfo,
            chainId,
            transactionHash: result.transactionHash,
            result
          }, '*');
        }

        // Redirect to upload page after successful payment
        setTimeout(() => {
          const uploadParams = new URLSearchParams({
            slotId: paymentInfo.slotId,
            price: paymentInfo.price,
            size: paymentInfo.size,
            category: paymentInfo.category,
            transactionHash: result.transactionHash || '',
            walletAddress: address || '',
            network: getNetworkName(chainId)
          });
          router.push(`/test-upload?${uploadParams.toString()}`);
        }, 2000); // Wait 2 seconds to show success message
      } else {
        throw new Error(result.error || 'Payment settlement failed');
      }
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      setConnectionStatus({ 
        type: 'error', 
        message: error.message || 'Payment failed. Please try again.' 
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
      loading: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };

    const icons = {
      loading: <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />,
      success: <CheckCircleIcon className="w-5 h-5" />,
      error: <ExclamationTriangleIcon className="w-5 h-5" />
    };

    return (
      <div className={`${statusClasses[connectionStatus.type]} border px-4 py-3 rounded-lg flex items-center gap-3`}>
        {icons[connectionStatus.type]}
        <span>{connectionStatus.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            USDC Payment Authorization
          </h1>
          <p className="text-gray-600">
            Sign USDC payment authorization on Polygon
          </p>
        </div>

        {/* Payment Information Card */}
        {paymentInfo && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Payment Details</CardTitle>
              <CardDescription className="text-blue-600">
                Review the details before signing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Slot ID:</span>
                  <span className="text-blue-600 font-mono">{paymentInfo.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Size:</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {paymentInfo.size}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Category:</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {paymentInfo.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Token:</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    USDC
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Network:</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Polygon
                  </Badge>
                </div>
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-800">Amount:</span>
                    <span className="font-bold text-xl text-blue-600">
                      {paymentInfo.price} USDC
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Connection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to sign the USDC payment authorization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center">
                <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Connect your wallet to continue
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Wallet Connected</p>
                      <p className="text-sm text-green-600 font-mono">
                        {formatAddress(address || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                {chainId && (
                  <div className={`p-3 border rounded-lg ${
                    isSupportedNetwork() 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className={`text-sm ${
                      isSupportedNetwork() ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      <span className="font-semibold">Network:</span> {getNetworkName(chainId)}
                    </p>
                    {!isSupportedNetwork() && (
                      <p className="text-yellow-600 text-xs mt-1">
                        ⚠️ Please switch to Polygon Amoy (80002) or Polygon Mainnet (137)
                      </p>
                    )}
                  </div>
                )}

                {/* Sign & Pay Button */}
                {paymentInfo && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Ready to Sign?</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      You will sign an EIP-3009 USDC payment authorization for <strong>{paymentInfo.price} USDC</strong>.
                    </p>
                    <div className="text-purple-600 text-xs mb-3 space-y-1">
                      <p>• No gas fees required for signing</p>
                      <p>• USDC contract: {chainId && USDC_CONFIG[chainId.toString() as keyof typeof USDC_CONFIG]?.address.slice(0, 10)}...</p>
                      <p>• Recipient: {PAYMENT_RECIPIENT.slice(0, 10)}...</p>
                      <p>• Valid for 1 hour after signing</p>
                    </div>
                    <Button
                      onClick={handleSignAndPay}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={connectionStatus.type === 'loading' || !isSupportedNetwork()}
                    >
                      {connectionStatus.type === 'loading' ? 'Processing...' : 'Sign USDC Authorization'}
                    </Button>
                  </div>
                )}

                {/* Disconnect Button */}
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        {renderConnectionStatus()}

        {/* Info Card */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <WalletIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">EIP-3009 USDC Authorization</h4>
                <p className="text-sm text-blue-700">
                  You'll sign an EIP-3009 transferWithAuthorization message for USDC on Polygon. 
                  This is gasless and only authorizes the payment - no tokens are transferred during signing.
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  <p>• Supported networks: Polygon Mainnet (137), Polygon Amoy (80002)</p>
                  <p>• Token: USDC with 6 decimal places</p>
                  <p>• Authorization expires in 1 hour</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}