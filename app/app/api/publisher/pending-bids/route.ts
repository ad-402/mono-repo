import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Get pending bids for publisher to review
 * Shows bids sorted by amount (highest first) for approval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherWallet = searchParams.get('wallet');
    const slotType = searchParams.get('slotType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!publisherWallet) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher wallet address is required' },
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

    // Build filter for pending bids
    const where: any = {
      publisherId: publisher.id,
      status: 'pending_approval',
      paymentVerified: true, // Only show bids with verified payment
    };

    if (slotType) {
      where.slotType = slotType;
    }

    // Get pending bids sorted by amount (highest first)
    const [bids, totalCount] = await Promise.all([
      prisma.bid.findMany({
        where,
        orderBy: [
          { bidAmount: 'desc' }, // Highest bidders first
          { createdAt: 'asc' },  // Then by time (FIFO)
        ],
        take: limit,
        skip: offset,
      }),
      prisma.bid.count({ where }),
    ]);

    // Format bids for publisher review
    const formattedBids = bids.map((bid) => ({
      id: bid.id,
      advertiser: `${bid.advertiserWallet.slice(0, 6)}...${bid.advertiserWallet.slice(-4)}`,
      slotType: bid.slotType,
      bidAmount: Number(bid.bidAmount).toFixed(6),
      durationMinutes: bid.durationMinutes,
      adTitle: bid.adTitle,
      adDescription: bid.adDescription,
      adContentHash: bid.adContentHash,
      clickUrl: bid.clickUrl,
      paymentVerified: bid.paymentVerified,
      transactionHash: bid.transactionHash,
      createdAt: bid.createdAt,
    }));

    // Get summary by slot type
    const slotTypeSummary = await prisma.bid.groupBy({
      by: ['slotType'],
      where: {
        publisherId: publisher.id,
        status: 'pending_approval',
        paymentVerified: true,
      },
      _count: true,
      _sum: {
        bidAmount: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      pendingBids: formattedBids,
      summary: {
        totalPending: totalCount,
        bySlotType: slotTypeSummary.map((s) => ({
          slotType: s.slotType,
          count: s._count,
          totalValue: Number(s._sum.bidAmount || 0).toFixed(6),
        })),
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching pending bids:', error);
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
