import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload API called');
    
    const body = await request.json();
    console.log('Test request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test upload endpoint working',
      receivedData: body
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { error: 'Test upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test upload endpoint is working',
    methods: ['POST']
  });
}
