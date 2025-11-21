import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Assign next available slot to highest bidder in queue
 * Can be called manually or by a cron job
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publisherWallet, slotType, slotStartTime } = body;

    if (!publisherWallet || !slotType) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher wallet and slot type are required' },
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

    // Find matching ad slot
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        publisherId: publisher.id,
        slotIdentifier: slotType,
        active: true,
      },
    });

    if (!adSlot) {
      const errorResponse = NextResponse.json(
        { error: 'Slot not found or inactive' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Get next bid in queue (highest bidder, FIFO within same amount)
    const nextBid = await prisma.bid.findFirst({
      where: {
        publisherId: publisher.id,
        slotType,
        status: 'approved',
      },
      orderBy: [
        { bidAmount: 'desc' }, // Highest bid first
        { approvedAt: 'asc' }, // Then oldest approval (FIFO)
      ],
    });

    if (!nextBid) {
      const errorResponse = NextResponse.json(
        { error: 'No approved bids in queue for this slot type' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Calculate slot timing
    const slotStart = slotStartTime ? new Date(slotStartTime) : new Date();
    const slotEnd = new Date(slotStart.getTime() + nextBid.durationMinutes * 60 * 1000);

    // Calculate platform fee
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    const bidAmount = Number(nextBid.bidAmount);
    const platformFee = (bidAmount * platformFeePercentage) / 100;
    const publisherRevenue = bidAmount - platformFee;

    // Create ad placement
    const placement = await prisma.adPlacement.create({
      data: {
        slotId: adSlot.id,
        publisherId: publisher.id,
        advertiserWallet: nextBid.advertiserWallet,
        contentType: 'image',
        contentUrl: nextBid.adContentHash,
        clickUrl: nextBid.clickUrl,
        description: nextBid.adDescription,
        price: nextBid.bidAmount,
        currency: nextBid.currency,
        durationMinutes: nextBid.durationMinutes,
        startsAt: slotStart,
        expiresAt: slotEnd,
        status: 'active',
        moderationStatus: 'approved',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        placementId: placement.id,
        publisherId: publisher.id,
        transactionHash: nextBid.transactionHash || '',
        amount: nextBid.bidAmount,
        currency: nextBid.currency,
        network: nextBid.network,
        platformFee,
        publisherRevenue,
        status: 'confirmed',
        verifiedAt: new Date(),
      },
    });

    // Update bid status to allocated
    await prisma.bid.update({
      where: { id: nextBid.id },
      data: {
        status: 'allocated',
        allocatedAt: new Date(),
        allocatedSlotStart: slotStart,
        allocatedSlotEnd: slotEnd,
        placementId: placement.id,
      },
    });

    // Update publisher stats
    await prisma.publisherStats.upsert({
      where: { publisherId: publisher.id },
      create: {
        publisherId: publisher.id,
        totalRevenue: publisherRevenue,
        totalAdsRun: 1,
        activeSlotsCount: 1,
      },
      update: {
        totalRevenue: {
          increment: publisherRevenue,
        },
        totalAdsRun: {
          increment: 1,
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Slot allocated successfully',
      allocation: {
        bidId: nextBid.id,
        placementId: placement.id,
        advertiser: `${nextBid.advertiserWallet.slice(0, 6)}...${nextBid.advertiserWallet.slice(-4)}`,
        slotType,
        bidAmount: Number(nextBid.bidAmount).toFixed(6),
        platformFee: platformFee.toFixed(6),
        publisherRevenue: publisherRevenue.toFixed(6),
        timing: {
          startsAt: slotStart,
          expiresAt: slotEnd,
          durationMinutes: nextBid.durationMinutes,
        },
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error assigning slot:', error);
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

/**
 * Auto-assign slots based on available capacity
 * Can be called by cron job to continuously allocate slots
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherWallet = searchParams.get('wallet');

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
      include: {
        adSlots: {
          where: { active: true },
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

    const assignments = [];

    // For each slot type, check if we can auto-assign
    for (const slot of publisher.adSlots) {
      // Check if slot has capacity (no active placement)
      const activePlacement = await prisma.adPlacement.findFirst({
        where: {
          slotId: slot.id,
          status: 'active',
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!activePlacement) {
        // Slot is available, get next bid
        const nextBid = await prisma.bid.findFirst({
          where: {
            publisherId: publisher.id,
            slotType: slot.slotIdentifier,
            status: 'approved',
          },
          orderBy: [
            { bidAmount: 'desc' },
            { approvedAt: 'asc' },
          ],
        });

        if (nextBid) {
          assignments.push({
            slotType: slot.slotIdentifier,
            bidId: nextBid.id,
            bidAmount: Number(nextBid.bidAmount).toFixed(6),
            canAutoAssign: true,
          });
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      publisher: {
        name: publisher.name,
        totalSlots: publisher.adSlots.length,
      },
      availableAssignments: assignments,
      message: assignments.length > 0
        ? `${assignments.length} slot(s) ready for assignment`
        : 'No slots available for assignment',
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error checking auto-assign:', error);
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
