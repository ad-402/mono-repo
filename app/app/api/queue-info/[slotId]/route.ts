import { NextRequest, NextResponse } from 'next/server';
import { getQueueInfo } from '@/lib/lighthouse-http-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;

    let queueInfo;

    try {
      queueInfo = await getQueueInfo(slotId);
    } catch (lighthouseError) {
      console.error('Lighthouse storage failed:', lighthouseError);
      // Return default queue info if Lighthouse fails
      queueInfo = {
        position: 0,
        totalInQueue: 0,
        isAvailable: true,
      };
    }

    return NextResponse.json({
      slotId,
      ...queueInfo,
      isAvailable: queueInfo.position === 0 && !queueInfo.nextActivation,
    });
  } catch (error) {
    console.error('Error getting queue info:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
