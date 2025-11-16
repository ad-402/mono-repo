import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addCorsHeaders } from '@/lib/cors-config';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get wallet address and filters from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Build filter conditions
    const where: any = {
      publisherId: publisher.id,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          placement: {
            select: {
              id: true,
              slotId: true,
              advertiserWallet: true,
              contentUrl: true,
              startsAt: true,
              expiresAt: true,
              status: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Format transactions
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      placementId: tx.placementId,
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      amount: Number(tx.amount).toFixed(6),
      currency: tx.currency,
      network: tx.network,
      platformFee: Number(tx.platformFee).toFixed(6),
      publisherRevenue: Number(tx.publisherRevenue).toFixed(6),
      status: tx.status,
      verifiedAt: tx.verifiedAt,
      createdAt: tx.createdAt,
      placement: tx.placement
        ? {
            slotId: tx.placement.slotId,
            advertiserWallet: tx.placement.advertiserWallet,
            contentUrl: tx.placement.contentUrl,
            startsAt: tx.placement.startsAt,
            expiresAt: tx.placement.expiresAt,
            status: tx.placement.status,
          }
        : null,
    }));

    const response = NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
