'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Clock, DollarSign, Target, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const adSubmissionSchema = z.object({
  advertiserWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  contentType: z.enum(['image', 'video', 'text']),
  clickUrl: z.string().url('Invalid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.string().min(1, 'Please select a duration'),
  price: z.string().min(1, 'Price is required'),
  adFile: z.any().optional()
});

type AdSubmissionForm = z.infer<typeof adSubmissionSchema>;

export default function AdSlotPage() {
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AdSubmissionForm>({
    resolver: zodResolver(adSubmissionSchema)
  });

  const selectedDuration = watch('duration');
  const selectedPrice = watch('price');

  // Set default values
  React.useEffect(() => {
    setValue('price', '0.10');
  }, [setValue]);

  const onSubmit = async (data: AdSubmissionForm) => {
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('slotId', params.slotId as string);
      formData.append('advertiserWallet', data.advertiserWallet);
      formData.append('contentType', data.contentType);
      formData.append('clickUrl', data.clickUrl);
      formData.append('description', data.description);
      formData.append('duration', data.duration);
      formData.append('price', data.price);
      formData.append('paymentHash', 'x402-payment-completed'); // This would come from x402

      if (data.adFile && data.adFile[0]) {
        formData.append('adFile', data.adFile[0]);
      }

      const response = await fetch('/api/ad-placements', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ad');
      }

      setSuccess(true);
      
      // Redirect to success page or dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Ad Submitted Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your ad has been submitted and is pending approval. You will be redirected to the dashboard shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Ad</h1>
          <p className="text-gray-600 mt-2">Complete your ad submission for slot: {params.slotId}</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slot Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Slot Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Slot ID</label>
                  <p className="font-mono text-sm">{params.slotId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <Badge variant="secondary" className="text-xs">
                    ✅ Paid via x402
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-sm font-semibold">$0.01 USDC</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Submission Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ad Details</CardTitle>
                <CardDescription>
                  Fill in the details for your advertisement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Advertiser Wallet */}
                  <div>
                    <Label htmlFor="advertiserWallet">Advertiser Wallet Address</Label>
                    <Input
                      id="advertiserWallet"
                      placeholder="0x..."
                      {...register('advertiserWallet')}
                    />
                    {errors.advertiserWallet && (
                      <p className="text-red-500 text-sm mt-1">{errors.advertiserWallet.message}</p>
                    )}
                  </div>

                  {/* Content Type */}
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select onValueChange={(value) => setValue('contentType', value as 'image' | 'video' | 'text')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.contentType && (
                      <p className="text-red-500 text-sm mt-1">{errors.contentType.message}</p>
                    )}
                  </div>

                  {/* Click URL */}
                  <div>
                    <Label htmlFor="clickUrl">Click URL</Label>
                    <Input
                      id="clickUrl"
                      type="url"
                      placeholder="https://example.com"
                      {...register('clickUrl')}
                    />
                    {errors.clickUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.clickUrl.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe your advertisement..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select onValueChange={(value) => setValue('duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30m">30 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="6h">6 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <Label htmlFor="price">Price (USDC)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.10"
                      placeholder="0.10"
                      {...register('price')}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum price: $0.10 USDC
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="adFile">Ad File (Optional)</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="adFile"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="adFile"
                              type="file"
                              className="sr-only"
                              accept="image/*,video/*"
                              {...register('adFile')}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, MP4 up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ad'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
