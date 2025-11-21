import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Get trending publishers based on recent activity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d or 30d
    const limit = parseInt(searchParams.get('limit') || '10');

    const publishers = await prisma.publisher.findMany({
      where: {
        verified: true,
        stats: {
          isNot: null,
        },
      },
      include: {
        stats: true,
        adSlots: {
          where: { active: true },
          select: {
            slotIdentifier: true,
            size: true,
            basePrice: true,
          },
        },
      },
    });

    // Sort by views based on period
    const sortedPublishers = publishers
      .filter((p) => p.stats !== null)
      .sort((a, b) => {
        if (period === '30d') {
          return (b.stats?.viewsLast30Days || 0) - (a.stats?.viewsLast30Days || 0);
        }
        return (b.stats?.viewsLast7Days || 0) - (a.stats?.viewsLast7Days || 0);
      })
      .slice(0, limit);

    const formatted = sortedPublishers.map((pub) => ({
      id: pub.id,
      name: pub.name || 'Unnamed Publisher',
      domain: pub.websiteDomain,
      stats: {
        viewsLastWeek: pub.stats?.viewsLast7Days || 0,
        viewsLastMonth: pub.stats?.viewsLast30Days || 0,
        totalViews: pub.stats?.totalViews || 0,
        averageCTR: Number(pub.stats?.averageCTR || 0).toFixed(2),
        totalAdsRun: pub.stats?.totalAdsRun || 0,
        approvalRate: Number(pub.stats?.approvalRate || 100).toFixed(1),
      },
      availableSlots: pub.adSlots.length,
      minPrice: pub.adSlots.length > 0
        ? Math.min(...pub.adSlots.map((s) => Number(s.basePrice))).toFixed(2)
        : '0',
    }));

    const response = NextResponse.json({
      success: true,
      period,
      trending: formatted,
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching trending publishers:', error);
    const errorResponse = NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}
