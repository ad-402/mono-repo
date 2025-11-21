import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment, type PaymentVerificationParams } from '@/lib/payment-verification';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { handleCorsPreflightRequest, addCorsHeaders } from '@/lib/cors-config';
import { prisma } from '@/lib/prisma';
import type { Hash, Address } from 'viem';

// HTTP-based Lighthouse storage to avoid SDK dependencies
async function getLighthouseStorage() {
  try {
    const { storeAdPlacement } = await import('@/lib/lighthouse-http-storage');
    return { storeAdPlacement };
  } catch (error) {
    console.error('Failed to import lighthouse HTTP storage:', error);
    throw new Error('Lighthouse HTTP storage not available');
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

export async function POST(request: NextRequest) {
  try {
    // Apply IP-based rate limiting first
    const ipRateLimitResult = await applyRateLimit(request, {
      ipLimit: RATE_LIMITS.IP_LIMIT,
      windowMs: RATE_LIMITS.WINDOW_MS,
    });

    if (ipRateLimitResult) {
      return ipRateLimitResult;
    }

    console.log('Upload-ad API called:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      console.error('Missing required fields:', { slotId, mediaHash, paymentData, paymentInfo });
      return NextResponse.json(
        { error: 'Missing required fields', received: { slotId, mediaHash, paymentData, paymentInfo } },
        { status: 400 }
      );
    }

    // Validate payment data structure
    if (!paymentData.transactionHash || !paymentData.payerAddress || !paymentData.AmountPaid) {
      console.error('Invalid payment data structure:', paymentData);
      return NextResponse.json(
        { error: 'Invalid payment data. Missing transactionHash, payerAddress, or AmountPaid' },
        { status: 400 }
      );
    }

    // Apply wallet-based rate limiting for uploads
    const walletRateLimitResult = await applyRateLimit(request, {
      walletAddress: paymentData.payerAddress,
      walletLimit: RATE_LIMITS.UPLOAD_LIMIT,
      windowMs: RATE_LIMITS.UPLOAD_WINDOW_MS,
    });

    if (walletRateLimitResult) {
      return walletRateLimitResult;
    }

    console.log('Creating ad placement for slot:', slotId);
    console.log('Media hash:', mediaHash);
    console.log('Payment data:', paymentData);

    // Verify payment on blockchain (CRITICAL SECURITY CHECK)
    const network = (paymentData.network || 'polygon') as 'polygon' | 'polygon-amoy';
    const publisherWallet = (paymentData.recipientAddress || process.env.PAYMENT_RECIPIENT) as Address;

    if (!publisherWallet) {
      console.error('No publisher wallet address configured');
      return NextResponse.json(
        { error: 'Publisher wallet not configured' },
        { status: 500 }
      );
    }

    console.log('Verifying payment on blockchain...');
    const verificationResult = await verifyPayment({
      transactionHash: paymentData.transactionHash as Hash,
      network,
      expectedAmount: paymentData.AmountPaid,
      expectedRecipient: publisherWallet,
      expectedPayer: paymentData.payerAddress as Address,
    });

    if (!verificationResult.verified) {
      console.error('Payment verification failed:', verificationResult.error);
      return NextResponse.json(
        {
          error: 'Payment verification failed',
          details: verificationResult.error,
          suggestion: 'Please ensure your transaction was successful and has been confirmed on the blockchain',
        },
        { status: 402 } // 402 Payment Required
      );
    }

    console.log('Payment verified successfully:', {
      amount: verificationResult.amount,
      from: verificationResult.from,
      to: verificationResult.to,
      blockNumber: verificationResult.blockNumber,
    });

    // Get or create publisher
    let publisher = await prisma.publisher.findUnique({
      where: { walletAddress: publisherWallet.toLowerCase() },
    });

    if (!publisher) {
      publisher = await prisma.publisher.create({
        data: {
          walletAddress: publisherWallet.toLowerCase(),
        },
      });
    }

    // Calculate platform fee
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    const amount = parseFloat(verificationResult.amount!);
    const platformFee = (amount * platformFeePercentage) / 100;
    const publisherRevenue = amount - platformFee;

    console.log('Fee calculation:', {
      amount,
      platformFeePercentage,
      platformFee: platformFee.toFixed(6),
      publisherRevenue: publisherRevenue.toFixed(6),
    });

    // Calculate duration based on payment info or default to 1 hour
    // You can make this configurable based on the selected duration in paymentInfo
    const durationMinutes = 60; // Default to 1 hour

    // Create ad placement (with optional bidding)
    const bidAmount = paymentData.bidAmount || paymentData.AmountPaid;

    let placementHash: string;

    try {
      // Use dynamic import for lighthouse storage
      const { storeAdPlacement } = await getLighthouseStorage();
      placementHash = await storeAdPlacement(
        slotId,
        paymentData.payerAddress,
        mediaHash,
        paymentData.AmountPaid,
        durationMinutes,
        bidAmount
      );
      console.log('Successfully stored using Lighthouse persistent storage');
    } catch (lighthouseError) {
      console.error('Lighthouse storage failed:', lighthouseError);

      // Fail immediately if Lighthouse doesn't work
      const errorResponse = NextResponse.json(
        {
          error: 'Storage service unavailable',
          details: 'Unable to store ad placement. Please try again later.',
          technical: lighthouseError instanceof Error ? lighthouseError.message : 'Unknown error',
        },
        { status: 503 } // 503 Service Unavailable
      );
      return addCorsHeaders(errorResponse, request);
    }

    console.log('Ad placement created successfully:', placementHash);

    // Find the ad slot by slotIdentifier (slotId from request is the identifier, not UUID)
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        publisherId: publisher.id,
        slotIdentifier: slotId,
        active: true,
      },
    });

    if (!adSlot) {
      const errorResponse = NextResponse.json(
        {
          error: 'Ad slot not found',
          details: `No active slot found with identifier "${slotId}" for this publisher`,
        },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Save ad placement to database
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const adPlacement = await prisma.adPlacement.create({
      data: {
        slotId: adSlot.id, // Use the UUID from AdSlot, not the string identifier
        publisherId: publisher.id,
        advertiserWallet: paymentData.payerAddress.toLowerCase(),
        contentType: 'image', // Could be inferred from mediaHash
        contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        price: amount,
        currency: 'USDC',
        durationMinutes,
        startsAt,
        expiresAt,
        status: placementHash.startsWith('queued-') ? 'queued' : 'active',
        moderationStatus: 'approved', // Auto-approve for now, can add moderation later
      },
    });

    // Save payment record to database
    const payment = await prisma.payment.create({
      data: {
        placementId: adPlacement.id,
        publisherId: publisher.id,
        transactionHash: paymentData.transactionHash,
        blockNumber: Number(verificationResult.blockNumber || 0),
        amount,
        currency: 'USDC',
        network,
        platformFee,
        publisherRevenue,
        status: 'confirmed',
        verifiedAt: new Date(),
      },
    });

    console.log('Payment and placement saved to database:', {
      placementId: adPlacement.id,
      paymentId: payment.id,
    });

    const response = NextResponse.json({
      success: true,
      placement: {
        id: adPlacement.id,
        hash: placementHash,
        contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: adPlacement.status,
      },
      payment: {
        id: payment.id,
        transactionHash: payment.transactionHash,
        amount: amount.toFixed(6),
        platformFee: platformFee.toFixed(6),
        publisherRevenue: publisherRevenue.toFixed(6),
        currency: 'USDC',
      },
    });

    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('Error creating ad placement:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// Fallback handler for any other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}
