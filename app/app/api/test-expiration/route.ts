import { NextRequest, NextResponse } from 'next/server';
import { createTestAdWithShortExpiration } from '@/lib/lighthouse-storage-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, durationMinutes = 1 } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      );
    }

    // Create a test ad with short expiration
    const placementId = await createTestAdWithShortExpiration(slotId, durationMinutes);

    return NextResponse.json({
      success: true,
      message: `Test ad created for slot ${slotId} expiring in ${durationMinutes} minutes`,
      placementId,
      expiresIn: `${durationMinutes} minutes`
    });

  } catch (error) {
    console.error('Error creating test ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
