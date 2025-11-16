import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addCorsHeaders } from '@/lib/cors-config';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

const prisma = new PrismaClient();

// Minimum withdrawal amount in USDC
const MIN_WITHDRAWAL_AMOUNT = 10;

// Platform withdrawal fee (could be made configurable)
const WITHDRAWAL_FEE_PERCENTAGE = parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || '0');

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, {
      ipLimit: RATE_LIMITS.IP_LIMIT,
      windowMs: RATE_LIMITS.WINDOW_MS,
    });

    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();
    const { walletAddress, amount, currency = 'USDC', network = 'polygon' } = body;

    // Validation
    if (!walletAddress || !amount) {
      const errorResponse = NextResponse.json(
        { error: 'Wallet address and amount are required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    if (withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
      const errorResponse = NextResponse.json(
        {
          error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} ${currency}`,
        },
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

    // Calculate available balance
    const payments = await prisma.payment.findMany({
      where: { publisherId: publisher.id, status: 'confirmed' },
    });

    const totalEarnings = payments.reduce((sum, payment) => {
      return sum + Number(payment.publisherRevenue || payment.amount);
    }, 0);

    const withdrawals = await prisma.withdrawal.findMany({
      where: { publisherId: publisher.id },
    });

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + Number(w.amount), 0);

    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'pending' || w.status === 'processing')
      .reduce((sum, w) => sum + Number(w.amount), 0);

    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

    // Check if sufficient balance
    if (withdrawalAmount > availableBalance) {
      const errorResponse = NextResponse.json(
        {
          error: 'Insufficient balance',
          availableBalance: availableBalance.toFixed(6),
          requestedAmount: withdrawalAmount.toFixed(6),
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Calculate withdrawal fee
    const withdrawalFee = withdrawalAmount * (WITHDRAWAL_FEE_PERCENTAGE / 100);
    const netAmount = withdrawalAmount - withdrawalFee;

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        publisherId: publisher.id,
        amount: withdrawalAmount,
        currency,
        network,
        status: 'pending',
        walletAddress: walletAddress.toLowerCase(),
      },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        withdrawal: {
          id: withdrawal.id,
          amount: Number(withdrawal.amount).toFixed(6),
          currency: withdrawal.currency,
          network: withdrawal.network,
          status: withdrawal.status,
          walletAddress: withdrawal.walletAddress,
          requestedAt: withdrawal.requestedAt,
          withdrawalFee: withdrawalFee.toFixed(6),
          netAmount: netAmount.toFixed(6),
        },
        message: 'Withdrawal request submitted successfully. It will be processed within 24-48 hours.',
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
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

    // Get all withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: { publisherId: publisher.id },
      orderBy: { createdAt: 'desc' },
    });

    const formattedWithdrawals = withdrawals.map((w) => ({
      id: w.id,
      amount: Number(w.amount).toFixed(6),
      currency: w.currency,
      network: w.network,
      status: w.status,
      walletAddress: w.walletAddress,
      transactionHash: w.transactionHash,
      failureReason: w.failureReason,
      requestedAt: w.requestedAt,
      processedAt: w.processedAt,
    }));

    const response = NextResponse.json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
      },
    });

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
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
