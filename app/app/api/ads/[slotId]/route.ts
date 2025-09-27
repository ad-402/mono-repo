import { NextRequest, NextResponse } from 'next/server';
import { getAdPlacement } from '@/lib/lighthouse-storage-simple';

// Default slot configurations
const defaultSlots: Record<string, any> = {
  'demo-header': { size: 'banner', width: 728, height: 90 },
  'demo-square': { size: 'square', width: 300, height: 250 },
  'demo-mobile': { size: 'mobile', width: 320, height: 60 },
  'header-banner': { size: 'banner', width: 728, height: 90 },
  'sidebar': { size: 'sidebar', width: 160, height: 600 },
  'mid-article': { size: 'square', width: 300, height: 250 },
  'footer-banner': { size: 'banner', width: 728, height: 90 }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    // Get slot configuration
    const slotConfig = defaultSlots[slotId];
    if (!slotConfig) {
      return NextResponse.json({
        hasAd: false,
        message: 'Ad slot not found'
      }, { status: 404 });
    }

    // Get active placement
    const placement = await getAdPlacement(slotId);
    
    if (!placement) {
      return NextResponse.json({
        hasAd: false,
        message: 'No active ad found for this slot'
      }, { status: 404 });
    }
    
    // Return ad data
    return NextResponse.json({
      hasAd: true,
      contentUrl: placement.contentUrl,
      expiresAt: Math.floor(new Date(placement.expiresAt).getTime() / 1000),
      placementId: placement.placementId,
      amountPaid: placement.price,
      advertiserAddress: placement.advertiserWallet,
      slotInfo: {
        id: slotId,
        slotIdentifier: slotId,
        size: slotConfig.size,
        width: slotConfig.width,
        height: slotConfig.height
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
