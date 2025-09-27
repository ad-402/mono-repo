import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    // First, try to find the ad slot by slotId (which could be the slot identifier or the actual slot ID)
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        OR: [
          { id: slotId },
          { slotIdentifier: slotId }
        ]
      },
      include: {
        placements: {
          where: {
            status: 'active',
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            content: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!adSlot) {
      return NextResponse.json({
        hasAd: false,
        message: 'Ad slot not found'
      }, { status: 404 });
    }

    // Check if there's an active placement with content
    const activePlacement = adSlot.placements[0];
    
    if (!activePlacement || !activePlacement.content || activePlacement.content.length === 0) {
      return NextResponse.json({
        hasAd: false,
        message: 'No active ad found for this slot'
      }, { status: 404 });
    }

    const adContent = activePlacement.content[0];
    
    // Return ad data
    return NextResponse.json({
      hasAd: true,
      contentUrl: adContent.filePath, // This should be the IPFS URL or file path
      expiresAt: Math.floor(activePlacement.expiresAt.getTime() / 1000),
      placementId: activePlacement.id,
      amountPaid: activePlacement.price.toString(),
      advertiserAddress: activePlacement.advertiserWallet,
      slotInfo: {
        id: adSlot.id,
        slotIdentifier: adSlot.slotIdentifier,
        size: adSlot.size,
        width: adSlot.width,
        height: adSlot.height
      }
    });

  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
