// Simple wallet connection utilities
export interface WalletConnectConfig {
  projectId: string;
  rpc?: {
    [chainId: number]: string;
  };
}

export interface WalletConnectServiceEvents {
  onConnect?: (accounts: string[], chainId: number) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class WalletConnectService {
  private config: WalletConnectConfig;
  private events: WalletConnectServiceEvents;
  private connected: boolean = false;
  private account: string | null = null;
  private chainId: number | null = null;

  constructor(config: WalletConnectConfig, events: WalletConnectServiceEvents = {}) {
    this.config = config;
    this.events = events;
  }

  /**
   * Initialize wallet connection service
   */
  async initialize(): Promise<void> {
    // Simple initialization - actual connection handled by RainbowKit
  }

  /**
   * Connect to wallet
   */
  async connect(): Promise<void> {
    // Connection handled by RainbowKit modal
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.account = null;
    this.chainId = null;
    this.events.onDisconnect?.();
  }

  /**
   * Get current account
   */
  getAccount(): string | null {
    return this.account;
  }

  /**
   * Get current chain ID
   */
  getChainId(): number | null {
    return this.chainId;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Switch chain (if supported by wallet)
   */
  async switchChain(chainId: number): Promise<void> {
    if (!this.connected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw new Error(`Failed to switch chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network name from chain ID
   */
  getNetworkName(chainId: number): string {
    const networks: { [key: number]: string } = {
      137: 'Polygon Mainnet',
      80002: 'Polygon Amoy Testnet',
    };
    return networks[chainId] || `Chain ${chainId}`;
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.connected = false;
    this.account = null;
    this.chainId = null;
  }
}

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}