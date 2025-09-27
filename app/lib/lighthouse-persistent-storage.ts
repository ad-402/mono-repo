// Persistent storage using Lighthouse/IPFS for production deployment
import lighthouse from '@lighthouse-web3/sdk';

// Lighthouse API key
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

export interface StoredPlacement {
  slotId: string;
  placementId: string;
  advertiserWallet: string;
  contentUrl: string;
  contentHash: string;
  price: string;
  currency: string;
  durationMinutes: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled' | 'queued';
  createdAt: string;
  bidAmount?: string;
}

export interface SlotQueue {
  slotId: string;
  queue: StoredPlacement[];
  lastUpdated: string;
}

export interface StorageData {
  activePlacements: Record<string, StoredPlacement>;
  slotQueues: Record<string, SlotQueue>;
  lastUpdated: string;
}

// Cache for current data (refreshed from IPFS)
let cachedData: StorageData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Get the current storage data from IPFS
 */
async function getStorageData(): Promise<StorageData> {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedData;
    }

    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    // Try to fetch from the main storage hash
    const storageHash = process.env.LIGHTHOUSE_STORAGE_HASH;
    if (!storageHash) {
      // Initialize with empty data if no storage hash exists
      const initialData: StorageData = {
        activePlacements: {},
        slotQueues: {},
        lastUpdated: new Date().toISOString()
      };
      cachedData = initialData;
      lastFetchTime = now;
      return initialData;
    }

    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${storageHash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch storage data: ${response.status}`);
    }

    const data = await response.json();
    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error('Error fetching storage data:', error);
    // Return empty data if fetch fails
    const emptyData: StorageData = {
      activePlacements: {},
      slotQueues: {},
      lastUpdated: new Date().toISOString()
    };
    cachedData = emptyData;
    lastFetchTime = Date.now();
    return emptyData;
  }
}

/**
 * Save storage data to IPFS
 */
async function saveStorageData(data: StorageData): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    data.lastUpdated = new Date().toISOString();
    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY);

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      const hash = uploadResponse.data.Hash;
      
      // Update cache
      cachedData = data;
      lastFetchTime = Date.now();
      
      // Store the hash in environment variable for next fetch
      // Note: In production, you'd want to store this in a database or config service
      console.log(`Storage updated. New hash: ${hash}`);
      
      return hash;
    } else {
      throw new Error('Failed to upload storage data to Lighthouse');
    }
  } catch (error) {
    console.error('Error saving storage data:', error);
    throw error;
  }
}

/**
 * Store a new ad placement
 */
export async function storeAdPlacement(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number,
  bidAmount?: string
): Promise<string> {
  try {
    const data = await getStorageData();
    const placementId = `placement-${slotId}-${Date.now()}`;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const placement: StoredPlacement = {
      slotId,
      placementId,
      advertiserWallet,
      contentUrl: `https://gateway.lighthouse.storage/ipfs/${contentHash}`,
      contentHash,
      price,
      currency: 'USDC',
      durationMinutes,
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      bidAmount
    };

    // Check if slot is already occupied
    const existingPlacement = data.activePlacements[slotId];
    
    if (existingPlacement) {
      // Slot is occupied, add to queue
      await addToQueue(data, slotId, placement);
      console.log(`Slot ${slotId} is occupied, added to queue. Queue position: ${getQueuePosition(slotId)}`);
      await saveStorageData(data);
      return `queued-${placementId}`;
    } else {
      // Slot is available, activate immediately
      data.activePlacements[slotId] = placement;
      console.log(`Stored placement for slot ${slotId}:`, placement);
      await saveStorageData(data);
      return `stored-${placementId}`;
    }
  } catch (error) {
    console.error('Error storing ad placement:', error);
    throw error;
  }
}

/**
 * Get an ad placement
 */
export async function getAdPlacement(slotId: string): Promise<StoredPlacement | null> {
  try {
    const data = await getStorageData();
    const placement = data.activePlacements[slotId];
    
    if (!placement) {
      return null;
    }

    // Check if placement is still active
    const now = new Date();
    const expiresAt = new Date(placement.expiresAt);
    
    if (now > expiresAt) {
      // Mark as expired and remove from active placements
      placement.status = 'expired';
      delete data.activePlacements[slotId];
      console.log(`Ad expired for slot ${slotId} at ${expiresAt.toISOString()}`);
      
      // Activate next ad from queue
      await activateNextInQueue(data, slotId);
      await saveStorageData(data);
      
      return null;
    }

    return placement;
  } catch (error) {
    console.error('Error retrieving ad placement:', error);
    return null;
  }
}

/**
 * Add placement to queue
 */
async function addToQueue(data: StorageData, slotId: string, placement: StoredPlacement): Promise<void> {
  placement.status = 'queued';
  
  if (!data.slotQueues[slotId]) {
    data.slotQueues[slotId] = {
      slotId,
      queue: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Add to queue (sorted by bid amount)
  data.slotQueues[slotId].queue.push(placement);
  data.slotQueues[slotId].queue.sort((a, b) => {
    const bidA = parseFloat(a.bidAmount || a.price);
    const bidB = parseFloat(b.bidAmount || b.price);
    return bidB - bidA; // Higher bids first
  });
  
  data.slotQueues[slotId].lastUpdated = new Date().toISOString();
}

/**
 * Activate next placement in queue
 */
async function activateNextInQueue(data: StorageData, slotId: string): Promise<void> {
  const queue = data.slotQueues[slotId];
  if (!queue || queue.queue.length === 0) {
    return;
  }
  
  // Get the next ad from queue
  const nextPlacement = queue.queue.shift()!;
  nextPlacement.status = 'active';
  
  // Update start and end times
  const now = new Date();
  const durationMs = nextPlacement.durationMinutes * 60 * 1000;
  nextPlacement.startsAt = now.toISOString();
  nextPlacement.expiresAt = new Date(now.getTime() + durationMs).toISOString();
  
  // Activate the placement
  data.activePlacements[slotId] = nextPlacement;
  
  console.log(`Activated next ad in queue for slot ${slotId}: ${nextPlacement.placementId}`);
  
  // Update queue
  queue.lastUpdated = new Date().toISOString();
  if (queue.queue.length === 0) {
    delete data.slotQueues[slotId];
  }
}

/**
 * Get queue position for a slot
 */
export function getQueuePosition(slotId: string): number {
  // This is a simplified version - in practice you'd need to fetch from storage
  return 0; // Will be implemented with proper async data fetching
}

/**
 * Get queue information
 */
export async function getQueueInfo(slotId: string): Promise<{ position: number; totalInQueue: number; nextActivation?: string; isAvailable: boolean }> {
  try {
    const data = await getStorageData();
    const queue = data.slotQueues[slotId];
    const activePlacement = data.activePlacements[slotId];
    
    return {
      position: queue ? queue.queue.length : 0,
      totalInQueue: queue ? queue.queue.length : 0,
      nextActivation: activePlacement ? activePlacement.expiresAt : undefined,
      isAvailable: !activePlacement
    };
  } catch (error) {
    console.error('Error getting queue info:', error);
    return {
      position: 0,
      totalInQueue: 0,
      isAvailable: true
    };
  }
}

/**
 * Get all active placements
 */
export async function getAllActivePlacements(): Promise<StoredPlacement[]> {
  try {
    const data = await getStorageData();
    const now = new Date();
    const active: StoredPlacement[] = [];
    
    for (const [slotId, placement] of Object.entries(data.activePlacements)) {
      const expiresAt = new Date(placement.expiresAt);
      if (now <= expiresAt) {
        active.push(placement);
      } else {
        // Clean up expired ads
        delete data.activePlacements[slotId];
        console.log(`Ad expired and removed for slot ${slotId} at ${expiresAt.toISOString()}`);
      }
    }
    
    // Save cleaned data
    if (active.length !== Object.keys(data.activePlacements).length) {
      await saveStorageData(data);
    }
    
    return active;
  } catch (error) {
    console.error('Error getting all active placements:', error);
    return [];
  }
}

/**
 * Initialize test placements (for development)
 */
export async function initializeTestPlacements(durationMinutes: number = 60): Promise<void> {
  try {
    const data = await getStorageData();
    
    // Only initialize if no data exists
    if (Object.keys(data.activePlacements).length > 0) {
      console.log('Test placements already exist, skipping initialization');
      return;
    }

    console.log('Initializing test placements...');
    
    const defaultSlotConfigs = [
      { slotId: 'demo-header', contentUrl: 'https://picsum.photos/728/90?random=1', price: '0.25' },
      { slotId: 'demo-square', contentUrl: 'https://picsum.photos/300/250?random=2', price: '0.15' },
      { slotId: 'demo-mobile', contentUrl: 'https://picsum.photos/320/60?random=3', price: '0.08' },
      { slotId: 'header-banner', contentUrl: 'https://picsum.photos/728/90?random=4', price: '0.25' },
      { slotId: 'sidebar', contentUrl: 'https://picsum.photos/160/600?random=5', price: '0.12' },
      { slotId: 'mid-article', contentUrl: 'https://picsum.photos/300/250?random=6', price: '0.18' },
      { slotId: 'footer-banner', contentUrl: 'https://picsum.photos/728/90?random=7', price: '0.20' },
    ];

    for (const config of defaultSlotConfigs) {
      const placementId = `placement-${config.slotId}-001`;
      const startsAt = new Date();
      const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

      const placement: StoredPlacement = {
        slotId: config.slotId,
        placementId,
        advertiserWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        contentUrl: config.contentUrl,
        contentHash: `QmTestHash${Math.random().toString(36).substring(7)}`,
        price: config.price,
        currency: 'USDC',
        durationMinutes,
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      data.activePlacements[config.slotId] = placement;
    }
    
    await saveStorageData(data);
    console.log('Initialized test placements:', Object.keys(data.activePlacements).length);
  } catch (error) {
    console.error('Error initializing test placements:', error);
  }
}

/**
 * Create a test ad with short expiration
 */
export async function createTestAdWithShortExpiration(slotId: string, durationMinutes: number = 1): Promise<string> {
  try {
    const data = await getStorageData();
    const placementId = `test-placement-${slotId}-${Date.now()}`;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const placement: StoredPlacement = {
      slotId,
      placementId,
      advertiserWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      contentUrl: 'https://picsum.photos/728/90?random=test',
      contentHash: `QmTestHash${Date.now()}`,
      price: '0.25',
      currency: 'USDC',
      durationMinutes,
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Store in data
    data.activePlacements[slotId] = placement;
    await saveStorageData(data);

    console.log(`Created test ad for slot ${slotId} expiring in ${durationMinutes} minutes at ${expiresAt.toISOString()}`);

    return placementId;
  } catch (error) {
    console.error('Error creating test ad:', error);
    throw error;
  }
}
