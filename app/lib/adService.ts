// lib/adService.ts
interface AdRecord {
  index: string;
  media_hash: string;
  validUpto: number;
  txHash: string;
  AmountPaid: string;
  payerAddress: string;
  recieverAddress: string;
}

interface AdSlotConfig {
  route: string;
  position: number;
  size: string;
}

export class AdService {
  private static HASH_SERVICE_URL = 'https://mono-repo-wqlc.vercel.app';
  private static LIGHTHOUSE_GATEWAY = 'https://gateway.lighthouse.storage/ipfs';
  
  /**
   * Generate ad slot index from route and position
   */
  static generateSlotIndex(route: string, position: number, size: string): string {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'localhost:3000';
    return `${domain}${route}:${position}:${size}`;
  }

  /**
   * Check if ad slot has valid payment
   */
  static async checkAdPayment(slotConfig: AdSlotConfig): Promise<AdRecord | null> {
    try {
      const index = this.generateSlotIndex(slotConfig.route, slotConfig.position, slotConfig.size);
      const encodedIndex = encodeURIComponent(index);
      
      const response = await fetch(`${this.HASH_SERVICE_URL}/hashes/${encodedIndex}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No payment record found for slot: ${index}`);
          return null;
        }
        throw new Error(`Failed to check payment: ${response.status}`);
      }

      const adRecord: AdRecord = await response.json();
      
      // Check if payment is still valid
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > adRecord.validUpto) {
        console.log(`Ad payment expired for slot: ${index}`);
        return null;
      }

      console.log(`Valid payment found for slot: ${index}`, {
        txHash: adRecord.txHash,
        expiresAt: new Date(adRecord.validUpto * 1000)
      });

      return adRecord;
    } catch (error) {
      console.error('Error checking ad payment:', error);
      return null;
    }
  }

  /**
   * Get ad content URL from IPFS hash
   */
  static getContentUrl(ipfsHash: string): string {
    return `${this.LIGHTHOUSE_GATEWAY}/${ipfsHash}`;
  }

  /**
   * Download and cache ad content locally (Node.js environment)
   */
  static async downloadAdContent(ipfsHash: string, localPath: string): Promise<void> {
    try {
      const response = await fetch(this.getContentUrl(ipfsHash));
      
      if (!response.ok) {
        throw new Error(`Failed to download content: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      
      // In Node.js environment
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        // Ensure directory exists
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(localPath, Buffer.from(buffer));
        console.log(`Ad content saved to ${localPath}`);
      }
    } catch (error) {
      console.error('Error downloading ad content:', error);
      throw error;
    }
  }

  /**
   * Verify payment on blockchain (optional additional security)
   */
  static async verifyTransactionOnChain(txHash: string, expectedAmount: string): Promise<boolean> {
    // Implementation depends on your blockchain RPC setup
    // This is optional but adds extra security
    try {
      // Example for Polygon network
      const rpcUrl = 'https://polygon-rpc.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [txHash],
          id: 1
        })
      });

      const result = await response.json();
      if (result.result && result.result.blockNumber) {
        // Transaction exists and is mined
        console.log(`Transaction verified on-chain: ${txHash}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}
