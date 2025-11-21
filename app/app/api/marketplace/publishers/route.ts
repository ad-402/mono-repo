import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

/**
 * Browse all publishers in the marketplace
 * Shows publishers with their stats for advertisers to select
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'trending'; // trending, revenue, ctr
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');

    // Build publisher query with stats
    const publishers = await prisma.publisher.findMany({
      where: {
        verified: true, // Only show verified publishers
        ...(category && {
          adSlots: {
            some: {
              category,
            },
          },
        }),
      },
      include: {
        stats: true,
        adSlots: {
          where: {
            active: true,
          },
          select: {
            slotIdentifier: true,
            size: true,
            basePrice: true,
            category: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    // Calculate or create stats for publishers without them
    const enrichedPublishers = await Promise.all(
      publishers.map(async (pub) => {
        let stats = pub.stats;

        // If no stats exist, create default ones
        if (!stats) {
          stats = await prisma.publisherStats.create({
            data: {
              publisherId: pub.id,
            },
          });
        }

        return {
          id: pub.id,
          name: pub.name || 'Unnamed Publisher',
          domain: pub.websiteDomain,
          wallet: `${pub.walletAddress.slice(0, 6)}...${pub.walletAddress.slice(-4)}`,
          stats: {
            totalViews: stats.totalViews,
            totalClicks: stats.totalClicks,
            averageCTR: Number(stats.averageCTR).toFixed(2),
            totalRevenue: Number(stats.totalRevenue).toFixed(2),
            averageSlotPrice: Number(stats.averageSlotPrice).toFixed(2),
            activeSlotsCount: stats.activeSlotsCount,
            totalAdsRun: stats.totalAdsRun,
            viewsLast7Days: stats.viewsLast7Days,
            viewsLast30Days: stats.viewsLast30Days,
            approvalRate: Number(stats.approvalRate).toFixed(1),
          },
          slots: pub.adSlots.map((slot) => ({
            id: slot.slotIdentifier,
            size: slot.size,
            basePrice: Number(slot.basePrice).toFixed(2),
            category: slot.category,
          })),
          availableSlots: pub.adSlots.length,
        };
      })
    );

    // Sort publishers based on sortBy parameter
    enrichedPublishers.sort((a, b) => {
      if (sortBy === 'trending') {
        return b.stats.viewsLast7Days - a.stats.viewsLast7Days;
      } else if (sortBy === 'revenue') {
        return parseFloat(b.stats.totalRevenue) - parseFloat(a.stats.totalRevenue);
      } else if (sortBy === 'ctr') {
        return parseFloat(b.stats.averageCTR) - parseFloat(a.stats.averageCTR);
      }
      return 0;
    });

    const totalCount = await prisma.publisher.count({
      where: { verified: true },
    });

    const response = NextResponse.json({
      success: true,
      publishers: enrichedPublishers,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching publishers:', error);
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
