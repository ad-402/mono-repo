// app/api/ads/[...params]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AdService } from '@/lib/adService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const { params: routeParams } = await params;
    
    if (!routeParams || routeParams.length < 3) {
      return NextResponse.json(
        { error: 'Invalid parameters. Expected: route, position, size' },
        { status: 400 }
      );
    }

    const [route, position, size] = routeParams;

    // Check payment status
    const paymentRecord = await AdService.checkAdPayment({
      route: `/${route}`,
      position: parseInt(position),
      size
    });

    if (paymentRecord) {
      // Return ad metadata
      return NextResponse.json({
        hasAd: true,
        contentUrl: AdService.getContentUrl(paymentRecord.media_hash),
        expiresAt: paymentRecord.validUpto,
        txHash: paymentRecord.txHash,
        amountPaid: paymentRecord.AmountPaid,
        payerAddress: paymentRecord.payerAddress
      });
    } else {
      return NextResponse.json({
        hasAd: false,
        message: 'No valid payment found for this slot'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
