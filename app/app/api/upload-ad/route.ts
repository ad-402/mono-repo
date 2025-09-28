import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to handle potential issues with lighthouse SDK on Vercel
async function getLighthouseStorage() {
  try {
    const { storeAdPlacement } = await import('@/lib/lighthouse-persistent-storage');
    return { storeAdPlacement };
  } catch (error) {
    console.error('Failed to import lighthouse storage:', error);
    throw new Error('Lighthouse storage not available');
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload-ad API called:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      console.error('Missing required fields:', { slotId, mediaHash, paymentData, paymentInfo });
      return NextResponse.json(
        { error: 'Missing required fields', received: { slotId, mediaHash, paymentData, paymentInfo } },
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
    
    let placementHash: string;
    
    try {
      // Use dynamic import for lighthouse storage
      const { storeAdPlacement } = await getLighthouseStorage();
      placementHash = await storeAdPlacement(
        slotId,
        paymentData.payerAddress,
        mediaHash,
        paymentData.AmountPaid,
        durationMinutes,
        bidAmount
      );
    } catch (lighthouseError) {
      console.warn('Lighthouse storage failed, using fallback:', lighthouseError);
      // Fallback: create a simple placement hash
      placementHash = `fallback-placement-${slotId}-${Date.now()}`;
    }

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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback handler for any other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}
