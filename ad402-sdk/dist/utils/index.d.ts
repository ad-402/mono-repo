import { Ad402Config, AdData, QueueInfo, Ad402Error } from '../types';
/**
 * Create a default Ad402 configuration
 */
export declare const createDefaultConfig: (websiteId: string, walletAddress: string, overrides?: Partial<Ad402Config>) => Ad402Config;
/**
 * Validate Ad402 configuration
 */
export declare const validateConfig: (config: Ad402Config) => Ad402Error[];
/**
 * Check if a URL is valid
 */
export declare const isValidUrl: (url: string) => boolean;
/**
 * Check if a color is valid
 */
export declare const isValidColor: (color: string) => boolean;
/**
 * Check if a wallet address is valid (Ethereum format)
 */
export declare const isValidWalletAddress: (address: string) => boolean;
/**
 * Format price for display
 */
export declare const formatPrice: (price: string, currency?: string) => string;
/**
 * Format time remaining
 */
export declare const formatTimeRemaining: (expiresAt: number) => string;
/**
 * Generate checkout URL
 */
export declare const generateCheckoutUrl: (slotId: string, price: string, size: string, websiteId: string, walletAddress: string, apiBaseUrl?: string, additionalParams?: Record<string, string>) => string;
/**
 * Generate upload URL
 */
export declare const generateUploadUrl: (slotId: string, price: string, size: string, websiteId: string, walletAddress: string, apiBaseUrl?: string, additionalParams?: Record<string, string>) => string;
/**
 * Fetch ad data from API
 */
export declare const fetchAdData: (slotId: string, apiBaseUrl?: string) => Promise<AdData>;
/**
 * Fetch queue info from API
 */
export declare const fetchQueueInfo: (slotId: string, apiBaseUrl?: string) => Promise<QueueInfo>;
/**
 * Create a custom hook for ad data
 */
export declare const createAdDataHook: (slotId: string, apiBaseUrl?: string) => {
    fetchAdData: () => Promise<AdData>;
    fetchQueueInfo: () => Promise<QueueInfo>;
};
/**
 * Generate unique slot ID
 */
export declare const generateSlotId: (prefix?: string) => string;
/**
 * Parse slot configuration from URL parameters
 */
export declare const parseSlotConfigFromUrl: () => Partial<Ad402Config>;
/**
 * Track ad events
 */
export declare const trackAdEvent: (event: "view" | "click" | "error", slotId: string, websiteId: string, additionalData?: Record<string, any>) => void;
//# sourceMappingURL=index.d.ts.map