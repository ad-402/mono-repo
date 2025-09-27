// app/api/analytics/ad-click/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the ad click for analytics
    console.log('Ad Click:', {
      slotIndex: data.slotIndex,
      ipfsHash: data.ipfsHash,
      timestamp: new Date(data.timestamp).toISOString(),
      url: data.url
    });

    // Here you could store this data in a database
    // For now, we'll just log it
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad click:', error);
    return NextResponse.json(
      { error: 'Failed to track ad click' },
      { status: 500 }
    );
  }
}
