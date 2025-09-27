import { NextRequest, NextResponse } from 'next/server';
import { uploadToLighthouse, validateFile, FileMetadata } from '@/lib/lighthouse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const slotId = formData.get('slotId') as string;
    const contentType = formData.get('contentType') as string;
    const clickUrl = formData.get('clickUrl') as string;
    const description = formData.get('description') as string;
    const duration = formData.get('duration') as string;
    const price = formData.get('price') as string;
    const paymentHash = formData.get('paymentHash') as string;
    const adFile = formData.get('adFile') as File;

    // Get advertiser wallet from X402 payment headers
    const advertiserWallet = request.headers.get('x402-payer-address') || request.headers.get('x-payer-address') || 'anonymous';

    // Validate required fields
    if (!slotId || !contentType || !duration || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate wallet address format if provided
    if (advertiserWallet !== 'anonymous' && !advertiserWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid wallet address format from payment headers' }, { status: 400 });
    }

    // Validate URL format
    if (clickUrl && !clickUrl.match(/^https?:\/\/.+/)) {
      return NextResponse.json({ error: 'Invalid click URL format' }, { status: 400 });
    }

    let fileUploadResult = null;
    
    // Handle file upload if present
    if (adFile && adFile.size > 0) {
      // Validate file
      const validation = validateFile(adFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Prepare metadata for Lighthouse
      const fileMetadata: FileMetadata = {
        name: adFile.name,
        size: adFile.size,
        type: contentType,
        description: description,
        slotId: slotId,
        advertiserWallet: advertiserWallet,
      };

      // Upload to Lighthouse
      fileUploadResult = await uploadToLighthouse(adFile, fileMetadata);
      
      if (!fileUploadResult.success) {
        return NextResponse.json({ 
          error: `File upload failed: ${fileUploadResult.error}` 
        }, { status: 500 });
      }
    }

    // Create submission record (without database - just return the data)
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slotId,
      advertiserWallet,
      contentType,
      clickUrl,
      description,
      duration,
      price,
      paymentHash,
      fileUpload: fileUploadResult ? {
        hash: fileUploadResult.hash,
        url: fileUploadResult.url,
        fileName: adFile.name,
        fileSize: adFile.size,
        mimeType: adFile.type,
      } : null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      expiresAt: calculateExpiration(duration),
    };

    // In a real application, you might want to:
    // 1. Store this in a database
    // 2. Send notifications
    // 3. Process the submission
    // 4. Integrate with your ad serving system

    console.log('Ad submission received:', {
      id: submission.id,
      slotId: submission.slotId,
      advertiserWallet: submission.advertiserWallet,
      contentType: submission.contentType,
      hasFile: !!submission.fileUpload,
      fileHash: submission.fileUpload?.hash,
    });

    return NextResponse.json({
      success: true,
      submission,
      message: 'Ad submission received successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing ad submission:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function calculateExpiration(duration: string): string {
  const now = new Date();
  const durationMs = parseDuration(duration);
  const expiresAt = new Date(now.getTime() + durationMs);
  return expiresAt.toISOString();
}

function parseDuration(duration: string): number {
  const units: { [key: string]: number } = {
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  const match = duration.match(/^(\d+)([mhd])$/);
  if (match) {
    return parseInt(match[1]) * units[match[2]];
  }
  
  return 60 * 60 * 1000; // Default 1 hour
}
