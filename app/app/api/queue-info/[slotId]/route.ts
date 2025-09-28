import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to handle potential issues with lighthouse SDK on Vercel
async function getLighthouseStorage() {
  try {
    const { getQueueInfo } = await import('@/lib/lighthouse-persistent-storage');
    return { getQueueInfo };
  } catch (error) {
    console.error('Failed to import lighthouse storage:', error);
    throw new Error('Lighthouse storage not available');
  }
}

// Fallback storage for when Lighthouse is not available
async function getFallbackStorage() {
  try {
    const { getQueueInfoFallback } = await import('@/lib/fallback-storage');
    return { getQueueInfo: getQueueInfoFallback };
  } catch (error) {
    console.error('Failed to import fallback storage:', error);
    throw new Error('Fallback storage not available');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    let queueInfo;
    
    try {
      const { getQueueInfo } = await getLighthouseStorage();
      queueInfo = await getQueueInfo(slotId);
      console.log('Successfully retrieved queue info from Lighthouse persistent storage');
    } catch (lighthouseError) {
      console.error('Lighthouse storage failed:', lighthouseError);
      console.error('This should not happen in production. Check LIGHTHOUSE_API_KEY and network connectivity.');
      
      // Only use fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback storage in development mode only');
        try {
          const { getQueueInfo } = await getFallbackStorage();
          queueInfo = await getQueueInfo(slotId);
        } catch (fallbackError) {
          console.warn('Fallback storage also failed, returning default queue info:', fallbackError);
          queueInfo = {
            position: 0,
            totalInQueue: 0,
            isAvailable: true
          };
        }
      } else {
        // In production, return default queue info if Lighthouse fails
        console.error('Lighthouse storage is required for production. Returning default queue info.');
        queueInfo = {
          position: 0,
          totalInQueue: 0,
          isAvailable: true
        };
      }
    }
    
    return NextResponse.json({
      slotId,
      ...queueInfo,
      isAvailable: queueInfo.position === 0 && !queueInfo.nextActivation
    });

  } catch (error) {
    console.error('Error getting queue info:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
