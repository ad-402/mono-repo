// Fallback storage for when Lighthouse is not available
// This is a simple in-memory storage that will reset on each serverless function invocation

interface FallbackPlacement {
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

interface FallbackQueue {
  slotId: string;
  queue: FallbackPlacement[];
  lastUpdated: string;
}

// In-memory storage (resets on each function invocation)
const fallbackStorage: {
  activePlacements: Record<string, FallbackPlacement>;
  slotQueues: Record<string, FallbackQueue>;
} = {
  activePlacements: {},
  slotQueues: {}
};

export async function storeAdPlacementFallback(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number,
  bidAmount?: string,
  currency: string = 'USDC'
): Promise<string> {
  const placementId = `fallback-placement-${slotId}-${Date.now()}`;
  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  const placement: FallbackPlacement = {
    slotId,
    placementId,
    advertiserWallet,
    contentUrl: `https://gateway.lighthouse.storage/ipfs/${contentHash}`,
    contentHash,
    price,
    currency,
    durationMinutes,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
    bidAmount
  };

  if (fallbackStorage.activePlacements[slotId]) {
    // Slot is occupied, add to queue
    if (!fallbackStorage.slotQueues[slotId]) {
      fallbackStorage.slotQueues[slotId] = {
        slotId,
        queue: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    placement.status = 'queued';
    fallbackStorage.slotQueues[slotId].queue.push(placement);
    fallbackStorage.slotQueues[slotId].queue.sort((a, b) => {
      const bidA = parseFloat(a.bidAmount || a.price);
      const bidB = parseFloat(b.bidAmount || b.price);
      return bidB - bidA; // Higher bids first
    });
    
    console.log(`Fallback: Slot ${slotId} is occupied, added to queue. Queue position: ${fallbackStorage.slotQueues[slotId].queue.length}`);
    return `queued-${placementId}`;
  } else {
    // Slot is available, activate immediately
    fallbackStorage.activePlacements[slotId] = placement;
    console.log(`Fallback: Stored placement for slot ${slotId}:`, placement);
    return `stored-${placementId}`;
  }
}

export async function getAdPlacementFallback(slotId: string): Promise<FallbackPlacement | null> {
  const placement = fallbackStorage.activePlacements[slotId];
  
  if (!placement) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(placement.expiresAt);

  if (now > expiresAt) {
    placement.status = 'expired';
    delete fallbackStorage.activePlacements[slotId];
    console.log(`Fallback: Ad expired for slot ${slotId} at ${expiresAt.toISOString()}`);

    // Activate next ad from queue
    const queue = fallbackStorage.slotQueues[slotId];
    if (queue && queue.queue.length > 0) {
      const nextPlacement = queue.queue.shift()!;
      nextPlacement.status = 'active';
      
      const now = new Date();
      const durationMs = nextPlacement.durationMinutes * 60 * 1000;
      nextPlacement.startsAt = now.toISOString();
      nextPlacement.expiresAt = new Date(now.getTime() + durationMs).toISOString();
      
      fallbackStorage.activePlacements[slotId] = nextPlacement;
      console.log(`Fallback: Activated next ad in queue for slot ${slotId}: ${nextPlacement.placementId}`);
      
      if (queue.queue.length === 0) {
        delete fallbackStorage.slotQueues[slotId];
      }
    }
    
    return null;
  }

  return placement;
}

export async function getQueueInfoFallback(slotId: string): Promise<{
  position: number;
  totalInQueue: number;
  nextActivation?: string;
  isAvailable: boolean;
}> {
  const queue = fallbackStorage.slotQueues[slotId];
  const activePlacement = fallbackStorage.activePlacements[slotId];

  return {
    position: queue ? queue.queue.length : 0,
    totalInQueue: queue ? queue.queue.length : 0,
    nextActivation: activePlacement ? activePlacement.expiresAt : undefined,
    isAvailable: !activePlacement || new Date(activePlacement.expiresAt) <= new Date()
  };
}
