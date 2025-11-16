import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addCorsHeaders } from '@/lib/cors-config';
import { applyRateLimit } from '@/lib/rate-limiter';
import { verifyPayment } from '@/lib/payment-verification';
import { type Address } from 'viem';

const prisma = new PrismaClient();

/**
 * Create a bid to enter the queue
 * Advertiser selects publisher + slot type and bids to get into the queue
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult) {
      // Rate limit exceeded, return the error response
      return addCorsHeaders(rateLimitResult, request);
    }

    const body = await request.json();
    const {
      publisherId,
      slotType,
      advertiserWallet,
      bidAmount,
      durationMinutes,
      adContentHash,
      adTitle,
      adDescription,
      clickUrl,
      transactionHash,
      network = 'polygon',
    } = body;

    // Validate required fields
    if (!publisherId || !slotType || !advertiserWallet || !bidAmount || !durationMinutes || !adContentHash) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields: publisherId, slotType, advertiserWallet, bidAmount, durationMinutes, adContentHash' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Verify publisher exists
    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      include: {
        adSlots: {
          where: {
            slotIdentifier: slotType,
            active: true,
          },
        },
      },
    });

    if (!publisher) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (publisher.adSlots.length === 0) {
      const errorResponse = NextResponse.json(
        { error: `Slot type "${slotType}" not available for this publisher` },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Validate bid amount is positive
    const bid = parseFloat(bidAmount);
    if (bid <= 0) {
      const errorResponse = NextResponse.json(
        { error: 'Bid amount must be greater than 0' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Verify payment if transaction hash provided
    let paymentVerified = false;
    if (transactionHash) {
      const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
      if (!platformWallet) {
        const errorResponse = NextResponse.json(
          { error: 'Platform wallet not configured' },
          { status: 500 }
        );
        return addCorsHeaders(errorResponse, request);
      }

      // Map network names to payment verification format
      const paymentNetwork = network === 'amoy' ? 'polygon-amoy' : (network as 'polygon' | 'polygon-amoy');

      const verificationResult = await verifyPayment({
        transactionHash,
        expectedAmount: bidAmount,
        expectedPayer: advertiserWallet as Address,
        expectedRecipient: platformWallet as Address,
        network: paymentNetwork,
      });

      if (!verificationResult.verified) {
        const errorResponse = NextResponse.json(
          {
            error: 'Payment verification failed',
            details: verificationResult.error,
          },
          { status: 400 }
        );
        return addCorsHeaders(errorResponse, request);
      }

      paymentVerified = true;
    }

    // Create bid in database
    const newBid = await prisma.bid.create({
      data: {
        publisherId,
        slotType,
        advertiserWallet: advertiserWallet.toLowerCase(),
        bidAmount: bid,
        durationMinutes,
        adContentHash,
        adTitle,
        adDescription,
        clickUrl,
        transactionHash,
        paymentVerified,
        network,
        status: 'pending_approval',
      },
      include: {
        publisher: {
          select: {
            name: true,
            websiteDomain: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      bid: {
        id: newBid.id,
        publisherId: newBid.publisherId,
        publisherName: newBid.publisher.name,
        publisherDomain: newBid.publisher.websiteDomain,
        slotType: newBid.slotType,
        bidAmount: Number(newBid.bidAmount).toFixed(6),
        durationMinutes: newBid.durationMinutes,
        status: newBid.status,
        paymentVerified: newBid.paymentVerified,
        createdAt: newBid.createdAt,
      },
      message: paymentVerified
        ? 'Bid created and awaiting publisher approval'
        : 'Bid created. Please submit payment to activate.',
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error creating bid:', error);
    const errorResponse = NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}
