import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload-ad API called:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    const body = await request.json();
    console.log('Simple request body received:', body);
    
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

    console.log('Simple ad placement would be created for slot:', slotId);

    // Simulate successful response without lighthouse storage
    return NextResponse.json({
      success: true,
      placement: {
        hash: `simple-placement-${slotId}-${Date.now()}`,
        contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      },
      message: 'Simple upload successful (no lighthouse storage)'
    });

  } catch (error) {
    console.error('Simple upload error:', error);
    return NextResponse.json(
      { error: 'Simple upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple upload-ad endpoint is working',
    methods: ['POST']
  });
}
