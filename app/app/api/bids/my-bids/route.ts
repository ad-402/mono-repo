import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Get advertiser's bids
 * Shows all bids for a specific advertiser wallet
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advertiserWallet = searchParams.get('wallet');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!advertiserWallet) {
      const errorResponse = NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Build filter
    const where: any = {
      advertiserWallet: advertiserWallet.toLowerCase(),
    };

    if (status) {
      where.status = status;
    }

    // Get bids
    const [bids, totalCount] = await Promise.all([
      prisma.bid.findMany({
        where,
        include: {
          publisher: {
            select: {
              name: true,
              websiteDomain: true,
            },
          },
          placement: {
            select: {
              viewCount: true,
              clickCount: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.bid.count({ where }),
    ]);

    // Format bids
    const formattedBids = bids.map((bid) => ({
      id: bid.id,
      publisher: {
        name: bid.publisher.name || 'Unnamed Publisher',
        domain: bid.publisher.websiteDomain,
      },
      slotType: bid.slotType,
      bidAmount: Number(bid.bidAmount).toFixed(6),
      durationMinutes: bid.durationMinutes,
      status: bid.status,
      paymentVerified: bid.paymentVerified,
      adTitle: bid.adTitle,
      adContentHash: bid.adContentHash,
      clickUrl: bid.clickUrl,
      createdAt: bid.createdAt,
      approvedAt: bid.approvedAt,
      rejectedAt: bid.rejectedAt,
      rejectionReason: bid.rejectionReason,
      allocation: bid.allocatedAt
        ? {
            allocatedAt: bid.allocatedAt,
            slotStart: bid.allocatedSlotStart,
            slotEnd: bid.allocatedSlotEnd,
          }
        : null,
      performance: bid.placement
        ? {
            views: bid.placement.viewCount,
            clicks: bid.placement.clickCount,
            ctr: bid.placement.viewCount > 0
              ? ((bid.placement.clickCount / bid.placement.viewCount) * 100).toFixed(2)
              : '0.00',
          }
        : null,
    }));

    // Calculate summary statistics
    const summary = {
      total: totalCount,
      pending: bids.filter((b) => b.status === 'pending_approval').length,
      approved: bids.filter((b) => b.status === 'approved').length,
      running: bids.filter((b) => b.status === 'running').length,
      completed: bids.filter((b) => b.status === 'completed').length,
      rejected: bids.filter((b) => b.status === 'rejected' || b.rejectedAt).length,
      totalSpent: bids
        .filter((b) => b.status === 'running' || b.status === 'completed')
        .reduce((sum, b) => sum + Number(b.bidAmount), 0)
        .toFixed(6),
    };

    const response = NextResponse.json({
      success: true,
      bids: formattedBids,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching bids:', error);
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
