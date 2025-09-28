import { ReactNode } from 'react';
export interface Ad402Config {
    /** Base URL of the Ad402 API (default: https://ad402.io) */
    apiBaseUrl?: string;
    /** Your website's unique identifier */
    websiteId: string;
    /** Your wallet address to receive payments (required) */
    walletAddress: string;
    /** Default slot configuration */
    defaultSlotConfig?: Partial<Ad402SlotConfig>;
    /** Theme configuration */
    theme?: Ad402Theme;
    /** Payment configuration */
    payment?: PaymentConfig;
}
export interface Ad402SlotConfig {
    /** Unique identifier for the ad slot */
    slotId: string;
    /** Size of the ad slot */
    size: 'banner' | 'square' | 'mobile' | 'sidebar';
    /** Base price in USDC */
    price: string;
    /** Available duration options */
    durations?: string[];
    /** Category for the ad slot */
    category?: string;
    /** Custom CSS class name */
    className?: string;
    /** Whether the slot is clickable for purchase */
    clickable?: boolean;
    /** Custom dimensions (overrides size defaults) */
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface Ad402Theme {
    /** Primary color (default: #000000) */
    primaryColor?: string;
    /** Background color (default: #ffffff) */
    backgroundColor?: string;
    /** Text color (default: #000000) */
    textColor?: string;
    /** Border color (default: #e5e5e5) */
    borderColor?: string;
    /** Font family (default: 'JetBrains Mono, monospace') */
    fontFamily?: string;
    /** Border radius (default: 0) */
    borderRadius?: number;
}
export interface PaymentConfig {
    /** Supported networks */
    networks?: string[];
    /** Default network */
    defaultNetwork?: string;
    /** Payment recipient address */
    recipientAddress?: string;
}
export interface AdData {
    /** Whether an ad is currently active */
    hasAd: boolean;
    /** URL of the ad content */
    contentUrl?: string;
    /** Expiration timestamp */
    expiresAt?: number;
    /** Placement ID */
    placementId?: string;
    /** Amount paid for the ad */
    amountPaid?: string;
    /** Advertiser wallet address */
    advertiserAddress?: string;
    /** Slot information */
    slotInfo?: SlotInfo;
}
export interface SlotInfo {
    id: string;
    slotIdentifier: string;
    size: string;
    width: number;
    height: number;
}
export interface QueueInfo {
    slotId: string;
    position: number;
    totalInQueue: number;
    nextActivation?: string;
    isAvailable: boolean;
}
export interface Ad402ProviderProps {
    /** Configuration object */
    config: Ad402Config;
    /** Child components */
    children: ReactNode;
}
export interface Ad402SlotProps extends Ad402SlotConfig {
    /** Callback when slot is clicked */
    onSlotClick?: (slotId: string) => void;
    /** Callback when ad is loaded */
    onAdLoad?: (adData: AdData) => void;
    /** Callback when ad fails to load */
    onAdError?: (error: Error) => void;
    /** Loading component */
    loadingComponent?: ReactNode;
    /** Error component */
    errorComponent?: ReactNode;
    /** Empty slot component */
    emptySlotComponent?: ReactNode;
}
export interface AdResponse {
    hasAd: boolean;
    contentUrl?: string;
    expiresAt?: number;
    placementId?: string;
    amountPaid?: string;
    advertiserAddress?: string;
    slotInfo?: SlotInfo;
    message?: string;
}
export interface QueueResponse {
    slotId: string;
    position: number;
    totalInQueue: number;
    nextActivation?: string;
    isAvailable: boolean;
}
export interface Ad402Error {
    code: string;
    message: string;
    details?: any;
}
export interface UseAd402SlotReturn {
    /** Current ad data */
    adData: AdData | null;
    /** Queue information */
    queueInfo: QueueInfo | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Ad402Error | null;
    /** Refresh function */
    refresh: () => Promise<void>;
    /** Purchase function */
    purchase: (bidAmount?: string) => Promise<void>;
}
export interface Ad402ContextType {
    config: Ad402Config;
    apiBaseUrl: string;
}
//# sourceMappingURL=index.d.ts.map