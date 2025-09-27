import lighthouse from '@lighthouse-web3/sdk';

// Lighthouse API key
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

export interface SlotIndex {
  slotId: string;
  slotHash: string;
  lastUpdated: string;
}

export interface PlacementIndex {
  slotId: string;
  placementHash: string;
  isActive: boolean;
  expiresAt: string;
  lastUpdated: string;
}

/**
 * Store slot index on Lighthouse
 */
export async function storeSlotIndex(slotId: string, slotHash: string): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    const indexData: SlotIndex = {
      slotId,
      slotHash,
      lastUpdated: new Date().toISOString()
    };

    const buffer = Buffer.from(JSON.stringify(indexData, null, 2));
    const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      return uploadResponse.data.Hash;
    } else {
      throw new Error('Failed to upload slot index to Lighthouse');
    }
  } catch (error) {
    console.error('Error storing slot index:', error);
    throw error;
  }
}

/**
 * Store placement index on Lighthouse
 */
export async function storePlacementIndex(
  slotId: string, 
  placementHash: string, 
  isActive: boolean, 
  expiresAt: string
): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    const indexData: PlacementIndex = {
      slotId,
      placementHash,
      isActive,
      expiresAt,
      lastUpdated: new Date().toISOString()
    };

    const buffer = Buffer.from(JSON.stringify(indexData, null, 2));
    const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      return uploadResponse.data.Hash;
    } else {
      throw new Error('Failed to upload placement index to Lighthouse');
    }
  } catch (error) {
    console.error('Error storing placement index:', error);
    throw error;
  }
}

/**
 * Get data from Lighthouse by hash
 */
export async function getDataFromLighthouse(hash: string): Promise<any> {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data from Lighthouse:', error);
    throw error;
  }
}

/**
 * Initialize default slot data on Lighthouse
 */
export async function initializeDefaultSlots(): Promise<void> {
  try {
    const defaultSlots = [
      {
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
      {
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
      {
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
      {
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
      {
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
      {
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
      {
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
    ];

    console.log('Initializing default slots on Lighthouse...');
    
    for (const slot of defaultSlots) {
      try {
        // Store slot data
        const dataToStore = {
          type: 'ad_slot',
          ...slot,
          storedAt: new Date().toISOString()
        };

        const buffer = Buffer.from(JSON.stringify(dataToStore, null, 2));
        const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

        if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
          const slotHash = uploadResponse.data.Hash;
          
          // Store slot index
          await storeSlotIndex(slot.slotId, slotHash);
          
          console.log(`Initialized slot: ${slot.slotId} -> ${slotHash}`);
        }
      } catch (error) {
        console.error(`Error initializing slot ${slot.slotId}:`, error);
      }
    }

    console.log('Default slots initialized successfully!');
  } catch (error) {
    console.error('Error initializing default slots:', error);
    throw error;
  }
}
