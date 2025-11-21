import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { placementId, paymentHash, signature, advertiserWallet } = await request.json();
    
    // Get placement and payment
    const placement = await prisma.adPlacement.findUnique({
      where: { id: placementId },
      include: { 
        payment: true,
        slot: true
      }
    });
    
    if (!placement || !placement.payment) {
      return NextResponse.json({ error: 'Placement or payment not found' }, { status: 404 });
    }
    
    // Verify payment signature
    const isValidSignature = await verifyPaymentSignature(
      placement.payment.transactionHash,
      signature,
      advertiserWallet
    );
    
    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: placement.payment.id },
      data: {
        status: 'confirmed',
        verifiedAt: new Date()
      }
    });
    
    // Update placement status
    await prisma.adPlacement.update({
      where: { id: placementId },
      data: {
        status: 'active',
        moderationStatus: 'approved'
      }
    });
    
    return NextResponse.json({ success: true, verified: true });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function verifyPaymentSignature(transactionHash: string, signature: string, address: string): Promise<boolean> {
  try {
    const message = `Payment for Ad-402: ${transactionHash}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}