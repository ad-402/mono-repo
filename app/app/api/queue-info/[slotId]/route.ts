import { NextRequest, NextResponse } from 'next/server';
import { getQueueInfo } from '@/lib/lighthouse-storage-simple';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    const queueInfo = getQueueInfo(slotId);
    
    return NextResponse.json({
      slotId,
      ...queueInfo,
      isAvailable: queueInfo.position === 0 && !queueInfo.nextActivation
    });

  } catch (error) {
    console.error('Error getting queue info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
