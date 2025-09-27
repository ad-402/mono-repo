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
        AmountPaid: price,
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
    if (!paymentData) throw new Error('Payment data not available');

    const adRecord = {
      index: paymentData.index,
      media_hash: mediaHash,
      validUpto: paymentData.validUpto,
      txHash: paymentData.txHash || `pending-${Date.now()}`,
      AmountPaid: paymentData.AmountPaid,
      payerAddress: paymentData.payerAddress,
      recieverAddress: paymentData.recieverAddress
    };

    console.log('Storing ad record:', adRecord);

    const response = await fetch(HASH_SERVICE_ENDPOINT, {
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
      setUploadStatus({ type: 'uploading', message: 'Uploading to Lighthouse...', progress: 0 });

      // Upload to Lighthouse
      const mediaHash = await uploadToLighthouse(selectedFile);
      setLighthouseHash(mediaHash);
      
      setUploadStatus({ type: 'uploading', message: 'Upload successful! Storing ad record...', progress: 50 });

      // Store in database
      setUploadStatus({ type: 'storing', message: 'Storing ad record in database...', progress: 75 });
      await storeAdRecord(mediaHash);

      setUploadStatus({ type: 'success', message: 'Ad successfully uploaded and stored!', progress: 100 });

      // Clean up session storage
      sessionStorage.removeItem('paymentData');
      sessionStorage.removeItem('paymentInfo');

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Upload failed. Please try again.' 
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
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
            Upload Your Ad
          </h1>
          <p className="text-gray-600">
            Upload your ad content to complete the process
          </p>
        </div>

        {/* Payment Summary Card */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Payment Confirmed
            </CardTitle>
            <CardDescription className="text-green-600">
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Slot ID:</span>
                <p className="text-green-600 font-mono">{paymentInfo.slotId}</p>
              </div>
              <div>
                <span className="font-medium text-green-800">Amount:</span>
                <p className="text-green-600">{paymentInfo.price} USDC</p>
              </div>
              <div>
                <span className="font-medium text-green-800">Size:</span>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {paymentInfo.size}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-green-800">Valid Until:</span>
                <p className="text-green-600">
                  {new Date(paymentData.validUpto * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Ad Content</CardTitle>
            <CardDescription>
              Select an image file for your advertisement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <CloudUploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-gray-600">
                  Supports JPG, PNG, GIF up to 5MB
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
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <ImageIcon className="w-12 h-12 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
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
                        className="max-w-full h-48 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={uploadStatus.type === 'uploading' || uploadStatus.type === 'storing'}
                >
                  {uploadStatus.type === 'uploading' || uploadStatus.type === 'storing' 
                    ? 'Processing...' 
                    : 'Upload to Lighthouse'
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {uploadStatus.progress !== undefined && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadStatus.progress}%</span>
                </div>
                <Progress value={uploadStatus.progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {uploadStatus.type !== 'idle' && (
          <Card className={`mb-6 ${
            uploadStatus.type === 'success' 
              ? 'border-green-200 bg-green-50' 
              : uploadStatus.type === 'error'
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {uploadStatus.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                {uploadStatus.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}
                {(uploadStatus.type === 'uploading' || uploadStatus.type === 'storing') && 
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                }
                <span className={
                  uploadStatus.type === 'success' 
                    ? 'text-green-800' 
                    : uploadStatus.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }>
                  {uploadStatus.message}
                </span>
              </div>
              
              {lighthouseHash && uploadStatus.type === 'success' && (
                <div className="mt-3 p-3 bg-white border border-green-200 rounded text-sm">
                  <p className="font-medium text-green-800 mb-1">IPFS Hash:</p>
                  <p className="font-mono text-green-700 break-all">{lighthouseHash}</p>
                  <p className="text-green-600 mt-2">
                    Your ad is now live and will be displayed on the specified slot!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Actions */}
        {uploadStatus.type === 'success' && (
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Go to Homepage
            </Button>
            <Button
              onClick={() => window.open(`https://gateway.lighthouse.storage/ipfs/${lighthouseHash}`, '_blank')}
              variant="outline"
              className="flex-1"
            >
              View on IPFS
            </Button>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CloudUploadIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Upload Process</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your image will be uploaded to Lighthouse (IPFS)</li>
                  <li>• The content hash will be stored in our database</li>
                  <li>• Your ad will be displayed on the purchased slot</li>
                  <li>• The ad will remain active until the expiry date</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
