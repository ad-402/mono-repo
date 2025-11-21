import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSlotSchema = z.object({
  publisherWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  slotIdentifier: z.string().min(1).max(100),
  size: z.enum(['banner', 'square', 'sidebar', 'leaderboard', 'mobile', 'card']),
  basePrice: z.string().regex(/^\d+\.?\d*$/),
  durationOptions: z.array(z.string()),
  category: z.string().optional(),
  websiteUrl: z.string().url()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSlotSchema.parse(body);
    
    // Get or create publisher
    let publisher = await prisma.publisher.findUnique({
      where: { walletAddress: data.publisherWallet }
    });
    
    if (!publisher) {
      publisher = await prisma.publisher.create({
        data: {
          walletAddress: data.publisherWallet,
          websiteDomain: new URL(data.websiteUrl).hostname
        }
      });
    }
    
    // Get slot dimensions
    const dimensions = getSlotDimensions(data.size);
    
    // Create ad slot
    const adSlot = await prisma.adSlot.create({
      data: {
        publisherId: publisher.id,
        slotIdentifier: data.slotIdentifier,
        size: data.size,
        width: dimensions.width,
        height: dimensions.height,
        basePrice: data.basePrice,
        durationOptions: data.durationOptions,
        category: data.category,
        websiteUrl: data.websiteUrl
      }
    });
    
    return NextResponse.json(adSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating ad slot:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherWallet = searchParams.get('publisherWallet');
    const websiteUrl = searchParams.get('websiteUrl');
    
    const slots = await prisma.adSlot.findMany({
      where: {
        publisher: {
          walletAddress: publisherWallet as string
        },
        websiteUrl: websiteUrl as string,
        active: true
      },
      include: {
        placements: {
          where: {
            status: 'active',
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            content: true
          }
        }
      }
    });
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSlotDimensions(size: string) {
  const dimensions = {
    banner: { width: 728, height: 90 },
    leaderboard: { width: 728, height: 90 },
    square: { width: 300, height: 250 },
    sidebar: { width: 160, height: 600 },
    mobile: { width: 320, height: 50 },
    card: { width: 300, height: 200 }
  };
  return dimensions[size as keyof typeof dimensions] || dimensions.banner;
}