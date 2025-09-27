import lighthouse from '@lighthouse-web3/sdk';

// Lighthouse API key
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

export interface AdSlotData {
  slotId: string;
  slotIdentifier: string;
  size: string;
  width: number;
  height: number;
  basePrice: string;
  durationOptions: string[];
  category?: string;
  websiteUrl: string;
  publisherWallet: string;
  createdAt: string;
}

export interface AdPlacementData {
  placementId: string;
  slotId: string;
  advertiserWallet: string;
  contentUrl: string;
  contentHash: string;
  price: string;
  currency: string;
  durationMinutes: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface AdSlotWithPlacement extends AdSlotData {
  activePlacement?: AdPlacementData;
}

/**
 * Store ad slot data on Lighthouse/IPFS
 */
export async function storeAdSlot(slotData: AdSlotData): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    const dataToStore = {
      type: 'ad_slot',
      ...slotData,
      storedAt: new Date().toISOString()
    };

    const buffer = Buffer.from(JSON.stringify(dataToStore, null, 2));
    const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      return uploadResponse.data.Hash;
    } else {
      throw new Error('Failed to upload slot data to Lighthouse');
    }
  } catch (error) {
    console.error('Error storing ad slot:', error);
    throw error;
  }
}

/**
 * Store ad placement data on Lighthouse/IPFS
 */
export async function storeAdPlacement(placementData: AdPlacementData): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    const dataToStore = {
      type: 'ad_placement',
      ...placementData,
      storedAt: new Date().toISOString()
    };

    const buffer = Buffer.from(JSON.stringify(dataToStore, null, 2));
    const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      return uploadResponse.data.Hash;
    } else {
      throw new Error('Failed to upload placement data to Lighthouse');
    }
  } catch (error) {
    console.error('Error storing ad placement:', error);
    throw error;
  }
}

/**
 * Retrieve ad slot data from Lighthouse/IPFS
 */
export async function getAdSlot(slotId: string): Promise<AdSlotData | null> {
  try {
    // For now, we'll use a simple approach where we store slot data
    // In a real implementation, you might want to use a more sophisticated indexing system
    
    // This is a placeholder - in practice, you'd need a way to map slotId to IPFS hash
    // For demo purposes, we'll return some default slot data
    const defaultSlots: Record<string, AdSlotData> = {
      'demo-header': {
        slotId: 'demo-header',
        slotIdentifier: 'demo-header',
        size: 'banner',
        width: 728,
        height: 90,
        basePrice: '0.25',
        durationOptions: ['1h', '6h', '24h'],
        category: 'demo',
        websiteUrl: 'http://localhost:3000',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'demo-square': {
        slotId: 'demo-square',
        slotIdentifier: 'demo-square',
        size: 'square',
        width: 300,
        height: 250,
        basePrice: '0.15',
        durationOptions: ['1h', '6h', '24h'],
        category: 'demo',
        websiteUrl: 'http://localhost:3000',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'demo-mobile': {
        slotId: 'demo-mobile',
        slotIdentifier: 'demo-mobile',
        size: 'mobile',
        width: 320,
        height: 60,
        basePrice: '0.08',
        durationOptions: ['1h', '6h', '24h'],
        category: 'demo',
        websiteUrl: 'http://localhost:3000',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'header-banner': {
        slotId: 'header-banner',
        slotIdentifier: 'header-banner',
        size: 'banner',
        width: 728,
        height: 90,
        basePrice: '0.25',
        durationOptions: ['1h', '6h', '24h'],
        category: 'technology',
        websiteUrl: 'http://localhost:3000/blog',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'sidebar': {
        slotId: 'sidebar',
        slotIdentifier: 'sidebar',
        size: 'sidebar',
        width: 160,
        height: 600,
        basePrice: '0.12',
        durationOptions: ['1h', '6h', '24h'],
        category: 'general',
        websiteUrl: 'http://localhost:3000/blog',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'mid-article': {
        slotId: 'mid-article',
        slotIdentifier: 'mid-article',
        size: 'square',
        width: 300,
        height: 250,
        basePrice: '0.18',
        durationOptions: ['1h', '6h', '24h'],
        category: 'general',
        websiteUrl: 'http://localhost:3000/blog',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      },
      'footer-banner': {
        slotId: 'footer-banner',
        slotIdentifier: 'footer-banner',
        size: 'banner',
        width: 728,
        height: 90,
        basePrice: '0.20',
        durationOptions: ['1h', '6h', '24h'],
        category: 'general',
        websiteUrl: 'http://localhost:3000/blog',
        publisherWallet: '0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32',
        createdAt: new Date().toISOString()
      }
    };

    return defaultSlots[slotId] || null;
  } catch (error) {
    console.error('Error retrieving ad slot:', error);
    return null;
  }
}

/**
 * Retrieve ad placement data from Lighthouse/IPFS
 */
export async function getAdPlacement(slotId: string): Promise<AdPlacementData | null> {
  try {
    // For demo purposes, we'll return some test placements
    const testPlacements: Record<string, AdPlacementData> = {
      'demo-header': {
        placementId: 'placement-demo-header-001',
        slotId: 'demo-header',
        advertiserWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        contentUrl: 'https://picsum.photos/728/90?random=1',
        contentHash: 'QmDemoHeaderHash123',
        price: '0.25',
        currency: 'USDC',
        durationMinutes: 1440,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      },
      'demo-square': {
        placementId: 'placement-demo-square-001',
        slotId: 'demo-square',
        advertiserWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        contentUrl: 'https://picsum.photos/300/250?random=2',
        contentHash: 'QmDemoSquareHash123',
        price: '0.15',
        currency: 'USDC',
        durationMinutes: 1440,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      }
    };

    const placement = testPlacements[slotId];
    
    // Check if placement is still active
    if (placement && new Date(placement.expiresAt) > new Date()) {
      return placement;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving ad placement:', error);
    return null;
  }
}

/**
 * Get ad slot with active placement
 */
export async function getAdSlotWithPlacement(slotId: string): Promise<AdSlotWithPlacement | null> {
  try {
    const slot = await getAdSlot(slotId);
    if (!slot) return null;

    const placement = await getAdPlacement(slotId);
    
    return {
      ...slot,
      activePlacement: placement || undefined
    };
  } catch (error) {
    console.error('Error retrieving ad slot with placement:', error);
    return null;
  }
}

/**
 * Create a new ad placement
 */
export async function createAdPlacement(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number
): Promise<string> {
  try {
    const placementData: AdPlacementData = {
      placementId: `placement-${slotId}-${Date.now()}`,
      slotId,
      advertiserWallet,
      contentUrl: `https://gateway.lighthouse.storage/ipfs/${contentHash}`,
      contentHash,
      price,
      currency: 'USDC',
      durationMinutes,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const placementHash = await storeAdPlacement(placementData);
    return placementHash;
  } catch (error) {
    console.error('Error creating ad placement:', error);
    throw error;
  }
}
