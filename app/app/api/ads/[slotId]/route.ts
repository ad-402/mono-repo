import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to handle potential issues with lighthouse SDK on Vercel
async function getLighthouseStorage() {
  try {
    const { getAdPlacement } = await import('@/lib/lighthouse-persistent-storage');
    return { getAdPlacement };
  } catch (error) {
    console.error('Failed to import lighthouse storage:', error);
    throw new Error('Lighthouse storage not available');
  }
}

// Fallback storage for when Lighthouse is not available
async function getFallbackStorage() {
  try {
    const { getAdPlacementFallback } = await import('@/lib/fallback-storage');
    return { getAdPlacement: getAdPlacementFallback };
  } catch (error) {
    console.error('Failed to import fallback storage:', error);
    throw new Error('Fallback storage not available');
  }
}

// Default slot configurations
const defaultSlots: Record<string, any> = {
  'demo-header': { size: 'banner', width: 728, height: 90 },
  'demo-square': { size: 'square', width: 300, height: 250 },
  'demo-mobile': { size: 'mobile', width: 320, height: 60 },
  'header-banner': { size: 'banner', width: 728, height: 90 },
  'sidebar': { size: 'sidebar', width: 160, height: 600 },
  'mid-article': { size: 'square', width: 300, height: 250 },
  'footer-banner': { size: 'banner', width: 728, height: 90 },
  'test-persistent': { size: 'banner', width: 728, height: 90 },
  'test-persistent-key': { size: 'banner', width: 728, height: 90 },
  'test-persistent-final': { size: 'banner', width: 728, height: 90 },
  'test-slot-main': { size: 'banner', width: 728, height: 90 },
  'test-fallback-storage': { size: 'banner', width: 728, height: 90 },
  'production-test-slot': { size: 'banner', width: 728, height: 90 }
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

    // Get active placement with fallback
    let placement = null;
    
    try {
      const { getAdPlacement } = await getLighthouseStorage();
      placement = await getAdPlacement(slotId);
      console.log('Successfully retrieved ad from Lighthouse persistent storage');
    } catch (lighthouseError) {
      console.error('Lighthouse storage failed:', lighthouseError);
      console.error('This should not happen in production. Check LIGHTHOUSE_API_KEY and network connectivity.');
      
      // Only use fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback storage in development mode only');
        try {
          const { getAdPlacement } = await getFallbackStorage();
          placement = await getAdPlacement(slotId);
        } catch (fallbackError) {
          console.warn('Fallback storage also failed, no ad data available:', fallbackError);
        }
      } else {
        // In production, log the error but don't use fallback
        console.error('Lighthouse storage is required for production. No fallback available.');
      }
    }
    
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
