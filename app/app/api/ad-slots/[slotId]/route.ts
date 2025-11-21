import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
      include: {
        publisher: {
          select: {
            walletAddress: true,
            websiteDomain: true
          }
        }
      }
    });

    if (!slot) {
      return NextResponse.json({ error: 'Ad slot not found' }, { status: 404 });
    }

    return NextResponse.json(slot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
