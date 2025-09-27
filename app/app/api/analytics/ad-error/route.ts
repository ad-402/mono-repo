// app/api/analytics/ad-error/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the ad error for analytics
    console.log('Ad Error:', {
      slotIndex: data.slotIndex,
      error: data.error,
      timestamp: new Date(data.timestamp).toISOString(),
      url: data.url
    });

    // Here you could store this data in a database
    // For now, we'll just log it
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad error:', error);
    return NextResponse.json(
      { error: 'Failed to track ad error' },
      { status: 500 }
    );
  }
}
