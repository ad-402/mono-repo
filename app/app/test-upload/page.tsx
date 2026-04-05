'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Image, Video, FileText, ArrowLeft } from 'lucide-react';

function TestUploadPageContent() {
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
    <div className="min-h-screen bg-background py-8">
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
          <h1 className="text-3xl font-sans font-bold text-foreground">Upload Advertisement</h1>
          <p className="text-muted-foreground font-sans mt-2">
            Upload your advertisement content for the purchased slot
          </p>
        </div>

        {/* Payment Information Card */}
        {paymentData && (
          <Card className="terminal-card mb-6 border-accent/30">
            <CardHeader>
              <CardTitle className="font-sans text-accent">Payment Successful</CardTitle>
              <CardDescription className="font-sans text-accent/80">
                Your payment has been processed. Now upload your advertisement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-sans font-medium text-foreground">Slot ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">{paymentData.slotId}</p>
                </div>
                <div>
                  <Label className="text-sm font-sans font-medium text-foreground">Amount Paid</Label>
                  <p className="text-sm text-muted-foreground font-mono font-bold">{paymentData.price} USDC</p>
                </div>
                <div>
                  <Label className="text-sm font-sans font-medium text-foreground">Size</Label>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    {paymentData.size}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-sans font-medium text-foreground">Network</Label>
                  <p className="text-sm text-muted-foreground font-sans">{paymentData.network}</p>
                </div>
              </div>
              {paymentData.transactionHash && (
                <div className="mt-4">
                  <Label className="text-sm font-sans font-medium text-foreground">Transaction Hash</Label>
                  <p className="text-sm text-muted-foreground font-mono break-all">{paymentData.transactionHash}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="font-sans text-foreground">Upload Advertisement</CardTitle>
              <CardDescription className="font-sans text-muted-foreground">
                Select your advertisement file to upload to IPFS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile ? (
                <div className="p-4 border border-border bg-muted">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile)}
                    <div className="flex-1">
                      <p className="text-sm font-sans font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
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
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed hover:border-muted-foreground transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer bg-transparent font-sans font-medium text-accent hover:text-accent/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent"
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
                    <p className="text-xs text-muted-foreground font-sans">
                      Images, Videos, Text files up to 100MB
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !paymentData}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-sans"
              >
                {uploading ? 'Uploading...' : 'Upload Advertisement'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="font-sans text-foreground">Upload Results</CardTitle>
              <CardDescription className="font-sans text-muted-foreground">
                View the upload results and file information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 border border-destructive/30 bg-destructive/10">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-sans font-medium">Error</span>
                  </div>
                  <p className="text-destructive font-sans mt-1">{error}</p>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-4">
                  <div className="p-4 border border-accent/30 bg-accent/10">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-sans font-medium">Upload Successful!</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-sans font-medium text-muted-foreground">Submission ID</Label>
                      <p className="text-sm font-mono text-foreground">{uploadResult.submission.id}</p>
                    </div>

                    {uploadResult.submission.fileUpload && (
                      <>
                        <div>
                          <Label className="text-sm font-sans font-medium text-muted-foreground">IPFS Hash</Label>
                          <p className="text-sm font-mono text-foreground break-all">{uploadResult.submission.fileUpload.hash}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-sans font-medium text-muted-foreground">File URL</Label>
                          <a
                            href={uploadResult.submission.fileUpload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent hover:text-accent/80 break-all"
                          >
                            {uploadResult.submission.fileUpload.url}
                          </a>
                        </div>

                        <div>
                          <Label className="text-sm font-sans font-medium text-muted-foreground">File Info</Label>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{uploadResult.submission.fileUpload.fileName}</Badge>
                            <Badge variant="outline">{formatFileSize(uploadResult.submission.fileUpload.fileSize)}</Badge>
                            <Badge variant="outline">{uploadResult.submission.fileUpload.mimeType}</Badge>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-sm font-sans font-medium text-muted-foreground">Status</Label>
                      <Badge variant="secondary" className="mt-1">
                        {uploadResult.submission.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {!error && !uploadResult && (
                <div className="text-center text-muted-foreground py-8">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="font-sans">No upload results yet</p>
                  <p className="text-sm font-sans">Upload a file to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TestUploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TestUploadPageContent />
    </Suspense>
  );
}

