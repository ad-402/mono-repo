import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Get specific bid details and status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const { bidId } = await params;

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        publisher: {
          select: {
            name: true,
            websiteDomain: true,
            walletAddress: true,
          },
        },
        placement: {
          select: {
            viewCount: true,
            clickCount: true,
            startsAt: true,
            expiresAt: true,
            status: true,
          },
        },
      },
    });

    if (!bid) {
      const errorResponse = NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Calculate position in queue if approved but not allocated
    let queuePosition = null;
    if (bid.status === 'approved' && !bid.allocatedAt) {
      const higherBids = await prisma.bid.count({
        where: {
          publisherId: bid.publisherId,
          slotType: bid.slotType,
          status: 'approved',
          bidAmount: {
            gt: bid.bidAmount,
          },
          createdAt: {
            lt: bid.createdAt,
          },
        },
      });
      queuePosition = higherBids + 1;
    }

    const response = NextResponse.json({
      success: true,
      bid: {
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
        adDescription: bid.adDescription,
        adContentHash: bid.adContentHash,
        clickUrl: bid.clickUrl,
        createdAt: bid.createdAt,
        approval: {
          approvedAt: bid.approvedAt,
          approvedBy: bid.approvedBy,
          rejectedAt: bid.rejectedAt,
          rejectionReason: bid.rejectionReason,
        },
        allocation: bid.allocatedAt
          ? {
              allocatedAt: bid.allocatedAt,
              slotStart: bid.allocatedSlotStart,
              slotEnd: bid.allocatedSlotEnd,
              placementId: bid.placementId,
            }
          : null,
        queuePosition,
        performance: bid.placement
          ? {
              views: bid.placement.viewCount,
              clicks: bid.placement.clickCount,
              ctr: bid.placement.viewCount > 0
                ? ((bid.placement.clickCount / bid.placement.viewCount) * 100).toFixed(2)
                : '0.00',
              startsAt: bid.placement.startsAt,
              expiresAt: bid.placement.expiresAt,
              status: bid.placement.status,
            }
          : null,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching bid:', error);
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
