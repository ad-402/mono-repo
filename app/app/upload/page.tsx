// pages/upload/index.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Simple SVG icons
const CloudUploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface UploadStatus {
  type: 'idle' | 'uploading' | 'storing' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface PaymentInfo {
  slotId: string;
  price: string;
  size: string;
  durations: string[];
  category: string;
}

interface PaymentData {
  index: string;
  validUpto: number;
  txHash: string;
  AmountPaid: string;
  bidAmount?: string;
  payerAddress: string;
  recieverAddress: string;
}

// Database endpoint
const HASH_SERVICE_ENDPOINT = 'https://mono-repo-wqlc.vercel.app/hashes';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle', message: '' });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lighthouseHash, setLighthouseHash] = useState<string | null>(null);

  // Load payment data from URL parameters or session storage
  useEffect(() => {
    // First try to get from URL parameters (from checkout redirect)
    const slotId = searchParams.get('slotId');
    const price = searchParams.get('price');
    const bidAmount = searchParams.get('bidAmount');
    const size = searchParams.get('size');
    const category = searchParams.get('category');
    const transactionHash = searchParams.get('transactionHash');
    const walletAddress = searchParams.get('walletAddress');
    const network = searchParams.get('network');

    if (slotId && price && size && walletAddress) {
      // Create payment data from URL parameters
      const validUpto = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      setPaymentData({
        index: `${slotId}-${Date.now()}`, // Generate unique index
        validUpto,
        txHash: transactionHash || `pending-${Date.now()}`, // Use pending if no tx hash
        AmountPaid: bidAmount || price, // Use bid amount if provided, otherwise use base price
        bidAmount: bidAmount || undefined, // Store bid amount separately
        payerAddress: walletAddress,
        recieverAddress: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32' // Your recipient address
      });
      
      setPaymentInfo({
        slotId,
        price,
        size,
        durations: ['1h'], // Default duration
        category: category || 'general'
      });
    } else {
      // Fallback to session storage
      const storedPaymentData = sessionStorage.getItem('paymentData');
      const storedPaymentInfo = sessionStorage.getItem('paymentInfo');
      
      if (!storedPaymentData || !storedPaymentInfo) {
        // Redirect back to checkout if no payment data
        router.push('/checkout');
        return;
      }

      try {
        setPaymentData(JSON.parse(storedPaymentData));
        setPaymentInfo(JSON.parse(storedPaymentInfo));
      } catch (error) {
        console.error('Error parsing payment data:', error);
        router.push('/checkout');
      }
    }
  }, [router, searchParams]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadStatus({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size must be less than 5MB' });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ type: 'idle', message: '' });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Upload to Lighthouse
  const uploadToLighthouse = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Note: You'll need to add your Lighthouse API key as an environment variable
    const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    
    if (!LIGHTHOUSE_API_KEY || LIGHTHOUSE_API_KEY === 'your_lighthouse_api_key_here') {
      throw new Error('Lighthouse API key not configured. Please add NEXT_PUBLIC_LIGHTHOUSE_API_KEY to your .env.local file. Get your API key from https://lighthouse.storage/');
    }

    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result.Hash;
  };

  // Store ad record in database
  const storeAdRecord = async (mediaHash: string): Promise<void> => {
    if (!paymentData || !paymentInfo) throw new Error('Payment data not available');

    const adRecord = {
      slotId: paymentInfo.slotId,
      mediaHash: mediaHash,
      paymentData: paymentData,
      paymentInfo: paymentInfo
    };

    console.log('Storing ad record:', adRecord);

    const response = await fetch('/api/upload-ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adRecord)
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.error || 'Failed to store ad record');
    }

    return response.json();
  };

  // Handle complete upload process
  const handleUpload = async () => {
    if (!selectedFile || !paymentData) return;

    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading your ad...', progress: 0 });

      // Upload to Lighthouse
      const mediaHash = await uploadToLighthouse(selectedFile);
      setLighthouseHash(mediaHash);
      
      setUploadStatus({ type: 'uploading', message: 'Processing your ad...', progress: 50 });

      // Store in database
      setUploadStatus({ type: 'storing', message: 'Finalizing...', progress: 75 });
      await storeAdRecord(mediaHash);

      setUploadStatus({ type: 'success', message: 'Ad uploaded successfully!', progress: 100 });

      // Clean up session storage
      sessionStorage.removeItem('paymentData');
      sessionStorage.removeItem('paymentInfo');

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed. Please try again.' 
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Create a synthetic event for file selection
      const syntheticEvent = {
        target: { files: [file] },
        currentTarget: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
  };

  if (!paymentInfo || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-mono">Loading payment information...</p>
        </div>
      </div>
    );
  }

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
            Upload Your Ad
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Upload your ad content to complete the process
          </p>
        </div>

        {/* Payment Summary Card */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-foreground mx-auto mb-2" />
              <h3 className="font-mono font-semibold text-foreground text-sm">Payment Confirmed</h3>
            </div>
            
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slot:</span>
                <span className="text-foreground">{paymentInfo.slotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-foreground">
                  {paymentData.bidAmount || paymentInfo.price} USDC
                  {paymentData.bidAmount && paymentData.bidAmount !== paymentInfo.price && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (bid)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="text-foreground">{paymentInfo.size}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-border p-8 text-center hover:border-foreground transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <CloudUploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-mono font-medium text-foreground mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  JPG, PNG, GIF up to 5MB
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div className="border border-border p-4">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-8 h-8 text-foreground" />
                    <div className="flex-1">
                      <h4 className="font-mono font-medium text-foreground text-sm">{selectedFile.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setUploadStatus({ type: 'idle', message: '' });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  {previewUrl && (
                    <div className="mt-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover border border-border"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-12"
                  disabled={uploadStatus.type === 'uploading' || uploadStatus.type === 'storing'}
                >
                  {uploadStatus.type === 'uploading' || uploadStatus.type === 'storing' 
                    ? 'Processing...' 
                    : 'Upload Ad'
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {uploadStatus.type !== 'idle' && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {uploadStatus.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-foreground" />}
                {uploadStatus.type === 'error' && <ExclamationTriangleIcon className="w-4 h-4 text-foreground" />}
                {(uploadStatus.type === 'uploading' || uploadStatus.type === 'storing') && 
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent" />
                }
                <span className="text-sm font-mono text-foreground">
                  {uploadStatus.message}
                </span>
              </div>
              
              {uploadStatus.type === 'success' && (
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  Your ad is now live!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Actions */}
        {uploadStatus.type === 'success' && (
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-12"
          >
            Go to Homepage
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}
