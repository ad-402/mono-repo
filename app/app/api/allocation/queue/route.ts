import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * View allocation queue for a publisher/slot
 * Shows approved bids waiting for slot allocation in priority order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherWallet = searchParams.get('wallet');
    const slotType = searchParams.get('slotType');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!publisherWallet) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher wallet is required' },
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

    // Build filter
    const where: any = {
      publisherId: publisher.id,
      status: 'approved', // Only approved bids in queue
    };

    if (slotType) {
      where.slotType = slotType;
    }

    // Get queue in priority order (highest bid first, then FIFO)
    const queue = await prisma.bid.findMany({
      where,
      orderBy: [
        { bidAmount: 'desc' }, // Highest bidders first (priority)
        { approvedAt: 'asc' }, // Then by approval time (FIFO)
      ],
      take: limit,
    });

    // Format queue with position numbers
    const formattedQueue = queue.map((bid, index) => ({
      position: index + 1,
      id: bid.id,
      advertiser: `${bid.advertiserWallet.slice(0, 6)}...${bid.advertiserWallet.slice(-4)}`,
      slotType: bid.slotType,
      bidAmount: Number(bid.bidAmount).toFixed(6),
      durationMinutes: bid.durationMinutes,
      adTitle: bid.adTitle,
      approvedAt: bid.approvedAt,
      waitingTime: bid.approvedAt
        ? Math.floor((Date.now() - new Date(bid.approvedAt).getTime()) / (1000 * 60))
        : 0,
    }));

    // Get summary by slot type
    const slotTypeSummary = await prisma.bid.groupBy({
      by: ['slotType'],
      where: {
        publisherId: publisher.id,
        status: 'approved',
      },
      _count: true,
      _sum: {
        bidAmount: true,
        durationMinutes: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      queue: formattedQueue,
      summary: {
        totalInQueue: queue.length,
        bySlotType: slotTypeSummary.map((s) => ({
          slotType: s.slotType,
          count: s._count,
          totalValue: Number(s._sum.bidAmount || 0).toFixed(6),
          totalDuration: s._sum.durationMinutes || 0,
        })),
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching allocation queue:', error);
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
