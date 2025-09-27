export interface Ad402Config {
  publisherWallet: string;
  network: string;
  currency: string;
  apiBaseUrl?: string;
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
}

export interface AdSlotData {
  id: string;
  slotIdentifier: string;
  size: string;
  width: number;
  height: number;
  basePrice: string;
  durationOptions: string[];
  placements: AdPlacement[];
}

export interface AdPlacement {
  id: string;
  contentType: string;
  contentUrl?: string;
  clickUrl?: string;
  description?: string;
  expiresAt: string;
  status: string;
  content: AdContent[];
}

export interface AdContent {
  id: string;
  type: string;
  filePath: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface Publisher {
  id: string;
  walletAddress: string;
  websiteDomain?: string;
  email?: string;
  name?: string;
  verified: boolean;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AdSlot {
  id: string;
  publisherId: string;
  slotIdentifier: string;
  size: string;
  width: number;
  height: number;
  basePrice: string;
  currency: string;
  network: string;
  durationOptions: string[];
  category?: string;
  moderationLevel: string;
  active: boolean;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
  publisher: Publisher;
  placements: AdPlacement[];
}

export interface Payment {
  id: string;
  placementId: string;
  publisherId: string;
  transactionHash: string;
  blockNumber?: number;
  amount: string;
  currency: string;
  network: string;
  platformFee: string;
  publisherRevenue: string;
  status: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  placementId: string;
  eventType: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  referrer?: string;
  metadata?: any;
}

export interface CreateSlotRequest {
  publisherWallet: string;
  slotIdentifier: string;
  size: 'banner' | 'square' | 'sidebar' | 'leaderboard' | 'mobile' | 'card';
  basePrice: string;
  durationOptions: string[];
  category?: string;
  websiteUrl: string;
}

export interface CreatePlacementRequest {
  slotId: string;
  advertiserWallet: string;
  contentType: string;
  clickUrl?: string;
  description?: string;
  duration: string;
  price: string;
  paymentHash: string;
  adFile?: File;
}

export interface PaymentVerificationRequest {
  placementId: string;
  paymentHash: string;
  signature: string;
  advertiserWallet: string;
}

export interface Ad402SDKConfig {
  publisherWallet: string;
  network?: string;
  currency?: string;
  apiBaseUrl?: string;
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
}

export interface Ad402SlotConfig {
  slotId: string;
  size?: 'banner' | 'square' | 'sidebar' | 'leaderboard' | 'mobile' | 'card';
  price?: string;
  durations?: string[];
  category?: string;
  className?: string;
  autoRegister?: boolean;
}

export interface Ad402ModalConfig {
  slotId: string;
  slotData: AdSlotData;
  onClose: () => void;
  onSuccess: (placement: AdPlacement) => void;
}

export interface Ad402PaymentConfig {
  amount: string;
  currency: string;
  recipient: string;
  network: string;
  metadata?: any;
}

export interface Ad402Analytics {
  trackView: (placementId: string, metadata?: any) => void;
  trackClick: (placementId: string, metadata?: any) => void;
  trackConversion: (placementId: string, metadata?: any) => void;
}