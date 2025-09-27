import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the ad slot
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        OR: [
          { id: slotId },
          { slotIdentifier: slotId }
        ]
      }
    });

    if (!adSlot) {
      return NextResponse.json(
        { error: 'Ad slot not found' },
        { status: 404 }
      );
    }

    // Calculate expiration time
    const durationMinutes = 60; // Default to 1 hour, you can make this configurable
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + (durationMinutes * 60 * 1000));

    // Create ad placement
    const placement = await prisma.adPlacement.create({
      data: {
        slotId: adSlot.id,
        publisherId: adSlot.publisherId,
        advertiserWallet: paymentData.payerAddress,
        contentType: 'image',
        contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        price: parseFloat(paymentData.AmountPaid),
        currency: 'USDC',
        durationMinutes: durationMinutes,
        startsAt: startsAt,
        expiresAt: expiresAt,
        status: 'active',
        moderationStatus: 'approved' // Auto-approve for now
      }
    });

    // Create ad content record
    const content = await prisma.adContent.create({
      data: {
        placementId: placement.id,
        type: 'image',
        fileName: `ad-${placement.id}.jpg`,
        filePath: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        fileSize: 0, // We don't have this info from IPFS
        mimeType: 'image/jpeg',
        width: adSlot.width,
        height: adSlot.height
      }
    });

    return NextResponse.json({
      success: true,
      placement: {
        id: placement.id,
        contentUrl: content.filePath,
        expiresAt: placement.expiresAt
      }
    });

  } catch (error) {
    console.error('Error creating ad placement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
