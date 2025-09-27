import { NextRequest, NextResponse } from 'next/server';
import { storeAdPlacement } from '@/lib/lighthouse-persistent-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating ad placement for slot:', slotId);
    console.log('Media hash:', mediaHash);
    console.log('Payment data:', paymentData);

    // Calculate duration based on payment info or default to 1 hour
    // You can make this configurable based on the selected duration in paymentInfo
    const durationMinutes = 60; // Default to 1 hour

    // Create ad placement (with optional bidding)
    const bidAmount = paymentData.bidAmount || paymentData.AmountPaid;
    const placementHash = await storeAdPlacement(
      slotId,
      paymentData.payerAddress,
      mediaHash,
      paymentData.AmountPaid,
      durationMinutes,
      bidAmount
    );

    console.log('Ad placement created successfully:', placementHash);

    return NextResponse.json({
      success: true,
      placement: {
        hash: placementHash,
        contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating ad placement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
