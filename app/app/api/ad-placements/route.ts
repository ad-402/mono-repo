import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const slotId = formData.get('slotId') as string;
    const advertiserWallet = formData.get('advertiserWallet') as string;
    const contentType = formData.get('contentType') as string;
    const clickUrl = formData.get('clickUrl') as string;
    const description = formData.get('description') as string;
    const duration = formData.get('duration') as string;
    const price = formData.get('price') as string;
    const paymentHash = formData.get('paymentHash') as string;
    const adFile = formData.get('adFile') as File;
    
    // Validate required fields
    if (!slotId || !advertiserWallet || !contentType || !duration || !price || !paymentHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get slot information
    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
      include: { publisher: true }
    });
    
    if (!slot) {
      return NextResponse.json({ error: 'Ad slot not found' }, { status: 404 });
    }
    
    // Calculate dates
    const startsAt = new Date();
    const durationMs = parseDuration(duration);
    const expiresAt = new Date(startsAt.getTime() + durationMs);
    
    // Create ad placement
    const placement = await prisma.adPlacement.create({
      data: {
        slotId,
        publisherId: slot.publisherId,
        advertiserWallet,
        contentType,
        clickUrl,
        description,
        price,
        durationMinutes: Math.floor(durationMs / 60000),
        startsAt,
        expiresAt,
        status: 'pending'
      }
    });
    
    // Handle file upload if present
    let contentUrl = '';
    if (adFile && adFile.size > 0) {
      const fileName = `${uuidv4()}${path.extname(adFile.name)}`;
      const filePath = `/uploads/ads/${fileName}`;
      
      // Save file
      const bytes = await adFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(`./public${filePath}`, buffer);
      
      contentUrl = filePath;
      
      await prisma.adContent.create({
        data: {
          placementId: placement.id,
          type: contentType,
          fileName: adFile.name,
          filePath: contentUrl,
          fileSize: adFile.size,
          mimeType: adFile.type
        }
      });
      
      // Update placement with content URL
      await prisma.adPlacement.update({
        where: { id: placement.id },
        data: { contentUrl }
      });
    }
    
    // Create payment record
    await prisma.payment.create({
      data: {
        placementId: placement.id,
        publisherId: slot.publisherId,
        transactionHash: paymentHash,
        amount: price,
        platformFee: parseFloat(price) * 0.05,
        publisherRevenue: parseFloat(price) * 0.95,
        status: 'pending'
      }
    });
    
    // Return placement with content
    const placementWithContent = await prisma.adPlacement.findUnique({
      where: { id: placement.id },
      include: {
        content: true,
        slot: true
      }
    });
    
    return NextResponse.json(placementWithContent, { status: 201 });
    
  } catch (error) {
    console.error('Error creating ad placement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseDuration(duration: string): number {
  const units: { [key: string]: number } = {
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  const match = duration.match(/^(\d+)([mhd])$/);
  if (match) {
    return parseInt(match[1]) * units[match[2]];
  }
  
  return 60 * 60 * 1000; // Default 1 hour
}