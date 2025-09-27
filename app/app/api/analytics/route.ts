import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { placementId, eventType, metadata } = await request.json();
    
    // Get client information
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Create analytics record
    const analytics = await prisma.analytics.create({
      data: {
        placementId,
        eventType,
        userAgent,
        ipAddress,
        metadata: metadata || {}
      }
    });
    
    // Update placement counters
    if (eventType === 'view') {
      await prisma.adPlacement.update({
        where: { id: placementId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    } else if (eventType === 'click') {
      await prisma.adPlacement.update({
        where: { id: placementId },
        data: {
          clickCount: {
            increment: 1
          }
        }
      });
    }
    
    return NextResponse.json(analytics, { status: 201 });
    
  } catch (error) {
    console.error('Error creating analytics record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placementId = searchParams.get('placementId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const where: any = {};
    
    if (placementId) {
      where.placementId = placementId;
    }
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }
    
    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limit to prevent large responses
    });
    
    return NextResponse.json(analytics);
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}