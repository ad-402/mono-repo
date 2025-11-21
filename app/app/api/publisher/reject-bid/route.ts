import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Reject a bid
 * Rejects bid and marks for refund
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bidId, publisherWallet, reason } = body;

    if (!bidId || !publisherWallet) {
      const errorResponse = NextResponse.json(
        { error: 'Bid ID and publisher wallet are required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Find publisher
    const publisher = await prisma.publisher.findUnique({
      where: { walletAddress: publisherWallet.toLowerCase() },
    });

    if (!publisher) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Find bid and verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
    });

    if (!bid) {
      const errorResponse = NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (bid.publisherId !== publisher.id) {
      const errorResponse = NextResponse.json(
        { error: 'You can only reject bids for your own slots' },
        { status: 403 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (bid.status !== 'pending_approval' && bid.status !== 'approved') {
      const errorResponse = NextResponse.json(
        { error: `Cannot reject bid with status: ${bid.status}` },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Reject the bid
    const rejectedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'Content not suitable',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Bid rejected successfully',
      bid: {
        id: rejectedBid.id,
        status: rejectedBid.status,
        rejectedAt: rejectedBid.rejectedAt,
        rejectionReason: rejectedBid.rejectionReason,
      },
      note: 'Bid marked for refund processing',
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error rejecting bid:', error);
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
