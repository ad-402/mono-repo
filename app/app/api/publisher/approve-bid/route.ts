import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Approve a bid
 * Moves bid from pending_approval to approved status
 * Approved bids enter the allocation queue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bidId, publisherWallet } = body;

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
        { error: 'You can only approve bids for your own slots' },
        { status: 403 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (bid.status !== 'pending_approval') {
      const errorResponse = NextResponse.json(
        { error: `Cannot approve bid with status: ${bid.status}` },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (!bid.paymentVerified) {
      const errorResponse = NextResponse.json(
        { error: 'Cannot approve bid without verified payment' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Approve the bid
    const approvedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: publisherWallet.toLowerCase(),
      },
    });

    // Update publisher stats - increment approval rate
    await prisma.publisherStats.upsert({
      where: { publisherId: publisher.id },
      create: {
        publisherId: publisher.id,
        approvalRate: 100,
      },
      update: {
        // Recalculate approval rate
        approvalRate: {
          increment: 0, // Will be recalculated in a separate job
        },
      },
    });

    // Calculate queue position
    const queuePosition = await prisma.bid.count({
      where: {
        publisherId: publisher.id,
        slotType: bid.slotType,
        status: 'approved',
        bidAmount: {
          gt: bid.bidAmount,
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Bid approved successfully',
      bid: {
        id: approvedBid.id,
        status: approvedBid.status,
        approvedAt: approvedBid.approvedAt,
        queuePosition: queuePosition + 1,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error approving bid:', error);
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
