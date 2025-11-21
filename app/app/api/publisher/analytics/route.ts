import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const slotId = searchParams.get('slotId'); // Optional: filter by slot

    if (!walletAddress) {
      const errorResponse = NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Get publisher
    const publisher = await prisma.publisher.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!publisher) {
      const errorResponse = NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Build filter for placements
    const placementWhere: any = {
      publisherId: publisher.id,
    };

    if (slotId) {
      placementWhere.slotId = slotId;
    }

    // Get all placements for this publisher
    const placements = await prisma.adPlacement.findMany({
      where: placementWhere,
      select: {
        id: true,
        slotId: true,
        viewCount: true,
        clickCount: true,
        price: true,
        currency: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalViews = placements.reduce((sum, p) => sum + p.viewCount, 0);
    const totalClicks = placements.reduce((sum, p) => sum + p.clickCount, 0);
    const totalRevenue = placements.reduce((sum, p) => sum + Number(p.price), 0);

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Calculate RPM (Revenue Per Mille/Thousand Impressions)
    const rpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0;

    // Calculate CPC (Cost Per Click)
    const cpc = totalClicks > 0 ? totalRevenue / totalClicks : 0;

    // Group analytics by slot
    const slotAnalytics: Record<
      string,
      { views: number; clicks: number; revenue: number; placements: number }
    > = {};

    placements.forEach((placement) => {
      if (!slotAnalytics[placement.slotId]) {
        slotAnalytics[placement.slotId] = {
          views: 0,
          clicks: 0,
          revenue: 0,
          placements: 0,
        };
      }
      slotAnalytics[placement.slotId].views += placement.viewCount;
      slotAnalytics[placement.slotId].clicks += placement.clickCount;
      slotAnalytics[placement.slotId].revenue += Number(placement.price);
      slotAnalytics[placement.slotId].placements += 1;
    });

    // Get top performing slots
    const topSlots = Object.entries(slotAnalytics)
      .map(([slotId, stats]) => ({
        slotId,
        ...stats,
        ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0,
        rpm: stats.views > 0 ? (stats.revenue / stats.views) * 1000 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get performance over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPlacements = placements.filter(
      (p) => p.createdAt >= thirtyDaysAgo
    );

    // Group by date
    const performanceByDate: Record<
      string,
      { views: number; clicks: number; revenue: number }
    > = {};

    recentPlacements.forEach((placement) => {
      const date = placement.createdAt.toISOString().split('T')[0];
      if (!performanceByDate[date]) {
        performanceByDate[date] = { views: 0, clicks: 0, revenue: 0 };
      }
      performanceByDate[date].views += placement.viewCount;
      performanceByDate[date].clicks += placement.clickCount;
      performanceByDate[date].revenue += Number(placement.price);
    });

    const response = NextResponse.json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalClicks,
          totalRevenue: totalRevenue.toFixed(6),
          totalPlacements: placements.length,
          ctr: ctr.toFixed(2),
          rpm: rpm.toFixed(6),
          cpc: cpc.toFixed(6),
          currency: 'USDC',
        },
        topSlots,
        performanceByDate,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching analytics:', error);
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
