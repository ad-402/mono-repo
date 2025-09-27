// Simple in-memory storage for Lighthouse data
// In a production system, you'd want to use a more sophisticated indexing system

interface StoredPlacement {
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
  bidAmount?: string; // For bidding system
}

interface SlotQueue {
  slotId: string;
  queue: StoredPlacement[];
  lastUpdated: string;
}

// In-memory storage for active placements
const activePlacements: Map<string, StoredPlacement> = new Map();

// In-memory storage for slot queues (bidding system)
const slotQueues: Map<string, SlotQueue> = new Map();

export async function storeAdPlacement(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number,
  bidAmount?: string
): Promise<string> {
  try {
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
    const existingPlacement = activePlacements.get(slotId);
    
    if (existingPlacement) {
      // Slot is occupied, add to queue
      await addToQueue(slotId, placement);
      console.log(`Slot ${slotId} is occupied, added to queue. Queue position: ${getQueuePosition(slotId)}`);
      return `queued-${placementId}`;
    } else {
      // Slot is available, activate immediately
      activePlacements.set(slotId, placement);
      console.log(`Stored placement for slot ${slotId}:`, placement);
      return `stored-${placementId}`;
    }
  } catch (error) {
    console.error('Error storing ad placement:', error);
    throw error;
  }
}

export async function getAdPlacement(slotId: string): Promise<StoredPlacement | null> {
  try {
    const placement = activePlacements.get(slotId);
    
    if (!placement) {
      return null;
    }

    // Check if placement is still active
    const now = new Date();
    const expiresAt = new Date(placement.expiresAt);
    
    if (now > expiresAt) {
      // Mark as expired and remove from active placements
      placement.status = 'expired';
      activePlacements.delete(slotId);
      console.log(`Ad expired for slot ${slotId} at ${expiresAt.toISOString()}`);
      
      // Activate next ad from queue
      await activateNextInQueue(slotId);
      
      return null;
    }

    return placement;
  } catch (error) {
    console.error('Error retrieving ad placement:', error);
    return null;
  }
}

// Queue management functions
async function addToQueue(slotId: string, placement: StoredPlacement): Promise<void> {
  placement.status = 'queued';
  
  let queue = slotQueues.get(slotId);
  if (!queue) {
    queue = {
      slotId,
      queue: [],
      lastUpdated: new Date().toISOString()
    };
    slotQueues.set(slotId, queue);
  }
  
  // Add to queue (sorted by bid amount if bidding is enabled)
  queue.queue.push(placement);
  queue.queue.sort((a, b) => {
    const bidA = parseFloat(a.bidAmount || a.price);
    const bidB = parseFloat(b.bidAmount || b.price);
    return bidB - bidA; // Higher bids first
  });
  
  queue.lastUpdated = new Date().toISOString();
}

async function activateNextInQueue(slotId: string): Promise<void> {
  const queue = slotQueues.get(slotId);
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
  activePlacements.set(slotId, nextPlacement);
  
  console.log(`Activated next ad in queue for slot ${slotId}: ${nextPlacement.placementId}`);
  
  // Update queue
  queue.lastUpdated = new Date().toISOString();
  if (queue.queue.length === 0) {
    slotQueues.delete(slotId);
  }
}

export function getQueuePosition(slotId: string): number {
  const queue = slotQueues.get(slotId);
  return queue ? queue.queue.length : 0;
}

export function getQueueInfo(slotId: string): { position: number; totalInQueue: number; nextActivation?: string } {
  const queue = slotQueues.get(slotId);
  const activePlacement = activePlacements.get(slotId);
  
  return {
    position: queue ? queue.queue.length : 0,
    totalInQueue: queue ? queue.queue.length : 0,
    nextActivation: activePlacement ? activePlacement.expiresAt : undefined
  };
}

export async function getAllActivePlacements(): Promise<StoredPlacement[]> {
  try {
    const now = new Date();
    const active: StoredPlacement[] = [];
    const expired: string[] = [];

    for (const [slotId, placement] of Array.from(activePlacements.entries())) {
      const expiresAt = new Date(placement.expiresAt);
      
      if (now > expiresAt) {
        expired.push(slotId);
      } else {
        active.push(placement);
      }
    }

    // Clean up expired placements
    for (const slotId of expired) {
      activePlacements.delete(slotId);
    }

    return active;
  } catch (error) {
    console.error('Error retrieving active placements:', error);
    return [];
  }
}

// Add some test data for demo purposes
export function initializeTestPlacements() {
  const testPlacements: StoredPlacement[] = [
    {
      slotId: 'demo-header',
      placementId: 'placement-demo-header-001',
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
    {
      slotId: 'demo-square',
      placementId: 'placement-demo-square-001',
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
  ];

  for (const placement of testPlacements) {
    activePlacements.set(placement.slotId, placement);
  }

  console.log('Initialized test placements:', testPlacements.length);
}

// Initialize test data when module loads
initializeTestPlacements();

// Function to create a test ad with short expiration (for testing)
export async function createTestAdWithShortExpiration(slotId: string, durationMinutes: number = 1): Promise<string> {
  try {
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

    // Store in memory
    activePlacements.set(slotId, placement);

    console.log(`Created test ad for slot ${slotId} expiring in ${durationMinutes} minutes at ${expiresAt.toISOString()}`);

    return placementId;
  } catch (error) {
    console.error('Error creating test ad:', error);
    throw error;
  }
}
