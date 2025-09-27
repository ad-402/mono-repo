// app/api/analytics/ad-view/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the ad view for analytics
    console.log('Ad View:', {
      slotIndex: data.slotIndex,
      ipfsHash: data.ipfsHash,
      timestamp: new Date(data.timestamp).toISOString(),
      userAgent: data.userAgent,
      referrer: data.referrer,
      url: data.url
    });

    // Here you could store this data in a database
    // For now, we'll just log it
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad view:', error);
    return NextResponse.json(
      { error: 'Failed to track ad view' },
      { status: 500 }
    );
  }
}
