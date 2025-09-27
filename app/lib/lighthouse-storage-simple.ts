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
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

// In-memory storage for active placements
const activePlacements: Map<string, StoredPlacement> = new Map();

export async function storeAdPlacement(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number
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
      createdAt: new Date().toISOString()
    };

    // Store in memory
    activePlacements.set(slotId, placement);

    console.log(`Stored placement for slot ${slotId}:`, placement);

    // In a real implementation, you would also store this on IPFS
    // For now, we'll just return a success indicator
    return `stored-${placementId}`;
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
      return null;
    }

    return placement;
  } catch (error) {
    console.error('Error retrieving ad placement:', error);
    return null;
  }
}

export async function getAllActivePlacements(): Promise<StoredPlacement[]> {
  try {
    const now = new Date();
    const active: StoredPlacement[] = [];
    const expired: string[] = [];

    for (const [slotId, placement] of activePlacements.entries()) {
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
