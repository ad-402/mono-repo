import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      lighthouseApiKey: process.env.LIGHTHOUSE_API_KEY ? 'SET' : 'NOT SET',
      lighthouseStorageHash: process.env.LIGHTHOUSE_STORAGE_HASH ? 'SET' : 'NOT SET'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
