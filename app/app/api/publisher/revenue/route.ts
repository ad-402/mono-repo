import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addCorsHeaders } from '@/lib/cors-config';

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      const errorResponse = NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Get or create publisher
    let publisher = await prisma.publisher.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!publisher) {
      // Create publisher if doesn't exist
      publisher = await prisma.publisher.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
        },
      });
    }

    // Get all payments for this publisher
    const payments = await prisma.payment.findMany({
      where: { publisherId: publisher.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total earnings
    const totalEarnings = payments.reduce((sum, payment) => {
      return sum + Number(payment.publisherRevenue || payment.amount);
    }, 0);

    // Calculate total platform fees
    const totalPlatformFees = payments.reduce((sum, payment) => {
      return sum + Number(payment.platformFee || 0);
    }, 0);

    // Get total amount (before fees)
    const totalAmount = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    // Get withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: { publisherId: publisher.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total withdrawn
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);

    // Calculate pending withdrawals
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'pending' || w.status === 'processing')
      .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);

    // Calculate available balance
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

    // Get earnings by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await prisma.payment.findMany({
      where: {
        publisherId: publisher.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const earningsByDate: Record<string, number> = {};
    recentPayments.forEach((payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      earningsByDate[date] = (earningsByDate[date] || 0) + Number(payment.publisherRevenue || payment.amount);
    });

    // Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthPayments = payments.filter(
      (p) => p.createdAt >= startOfMonth
    );

    const thisMonthEarnings = thisMonthPayments.reduce((sum, payment) => {
      return sum + Number(payment.publisherRevenue || payment.amount);
    }, 0);

    // Get today's earnings
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayPayments = payments.filter((p) => p.createdAt >= startOfDay);

    const todayEarnings = todayPayments.reduce((sum, payment) => {
      return sum + Number(payment.publisherRevenue || payment.amount);
    }, 0);

    const response = NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEarnings: totalEarnings.toFixed(6),
          totalAmount: totalAmount.toFixed(6),
          totalPlatformFees: totalPlatformFees.toFixed(6),
          totalWithdrawn: totalWithdrawn.toFixed(6),
          pendingWithdrawals: pendingWithdrawals.toFixed(6),
          availableBalance: availableBalance.toFixed(6),
          currency: 'USDC',
        },
        periodEarnings: {
          today: todayEarnings.toFixed(6),
          thisMonth: thisMonthEarnings.toFixed(6),
          allTime: totalEarnings.toFixed(6),
        },
        chart: {
          earningsByDate,
        },
        stats: {
          totalTransactions: payments.length,
          totalWithdrawalRequests: withdrawals.length,
          completedWithdrawals: withdrawals.filter((w) => w.status === 'completed').length,
        },
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
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
