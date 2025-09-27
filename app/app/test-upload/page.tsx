'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Image, Video, FileText, ArrowLeft } from 'lucide-react';

export default function TestUploadPage() {
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Extract payment data from URL parameters
  useEffect(() => {
    const slotId = searchParams.get('slotId');
    const price = searchParams.get('price');
    const size = searchParams.get('size');
    const category = searchParams.get('category');
    const transactionHash = searchParams.get('transactionHash');
    const walletAddress = searchParams.get('walletAddress');
    const network = searchParams.get('network');

    if (slotId && price && size) {
      setPaymentData({
        slotId,
        price,
        size,
        category: category || 'general',
        transactionHash: transactionHash || '',
        walletAddress: walletAddress || '',
        network: network || 'Unknown'
      });
    }
  }, [searchParams]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !paymentData) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('slotId', paymentData.slotId);
      formData.append('advertiserWallet', paymentData.walletAddress);
      formData.append('contentType', selectedFile.type.startsWith('image/') ? 'image' : 'video');
      formData.append('clickUrl', 'https://example.com');
      formData.append('description', `Ad for slot ${paymentData.slotId}`);
      formData.append('duration', '1h');
      formData.append('price', paymentData.price);
      formData.append('paymentHash', paymentData.transactionHash);
      formData.append('adFile', selectedFile);

      const response = await fetch('/api/ad-submissions', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Upload Advertisement</h1>
          <p className="text-gray-600 mt-2">
            Upload your advertisement content for the purchased slot
          </p>
        </div>

        {/* Payment Information Card */}
        {paymentData && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Payment Successful</CardTitle>
              <CardDescription className="text-green-600">
                Your payment has been processed. Now upload your advertisement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-green-800">Slot ID</Label>
                  <p className="text-sm text-green-600 font-mono">{paymentData.slotId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Amount Paid</Label>
                  <p className="text-sm text-green-600 font-bold">{paymentData.price} USDC</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Size</Label>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {paymentData.size}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Network</Label>
                  <p className="text-sm text-green-600">{paymentData.network}</p>
                </div>
              </div>
              {paymentData.transactionHash && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-green-800">Transaction Hash</Label>
                  <p className="text-sm text-green-600 font-mono break-all">{paymentData.transactionHash}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Advertisement</CardTitle>
              <CardDescription>
                Select your advertisement file to upload to IPFS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile ? (
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Select a file</span>
                        <input
                          id="file"
                          type="file"
                          className="sr-only"
                          accept="image/*,video/*,text/plain"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Images, Videos, Text files up to 100MB
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !paymentData}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Advertisement'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                View the upload results and file information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-4">
                  <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Upload Successful!</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Submission ID</Label>
                      <p className="text-sm font-mono">{uploadResult.submission.id}</p>
                    </div>

                    {uploadResult.submission.fileUpload && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">IPFS Hash</Label>
                          <p className="text-sm font-mono break-all">{uploadResult.submission.fileUpload.hash}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">File URL</Label>
                          <a
                            href={uploadResult.submission.fileUpload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                          >
                            {uploadResult.submission.fileUpload.url}
                          </a>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">File Info</Label>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{uploadResult.submission.fileUpload.fileName}</Badge>
                            <Badge variant="outline">{formatFileSize(uploadResult.submission.fileUpload.fileSize)}</Badge>
                            <Badge variant="outline">{uploadResult.submission.fileUpload.mimeType}</Badge>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge variant="secondary" className="mt-1">
                        {uploadResult.submission.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {!error && !uploadResult && (
                <div className="text-center text-gray-500 py-8">
                  <Upload className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No upload results yet</p>
                  <p className="text-sm">Upload a file to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
