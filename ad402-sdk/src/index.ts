// Main exports
export { Ad402Provider, useAd402Context, useAd402Config, useAd402Api } from './components/Ad402Provider';
export { Ad402Slot } from './components/Ad402Slot';

// Type exports
export type {
  Ad402Config,
  Ad402SlotConfig,
  Ad402Theme,
  PaymentConfig,
  AdData,
  SlotInfo,
  QueueInfo,
  Ad402ProviderProps,
  Ad402SlotProps,
  AdResponse,
  QueueResponse,
  Ad402Error,
  UseAd402SlotReturn,
  Ad402ContextType
} from './types';

// Utility exports
export {
  createDefaultConfig,
  validateConfig,
  isValidUrl,
  isValidColor,
  formatPrice,
  formatTimeRemaining,
  generateCheckoutUrl,
  generateUploadUrl,
  fetchAdData,
  fetchQueueInfo,
  createAdDataHook,
  generateSlotId,
  parseSlotConfigFromUrl,
  trackAdEvent
} from './utils';

// Default export
export { Ad402Provider as default } from './components/Ad402Provider';
