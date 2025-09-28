/**
 * Create a default Ad402 configuration
 */
export const createDefaultConfig = (websiteId, walletAddress, overrides) => {
    return {
        websiteId,
        walletAddress,
        apiBaseUrl: 'https://ad402.io',
        theme: {
            primaryColor: '#000000',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            borderColor: '#e5e5e5',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: 0
        },
        payment: {
            networks: ['polygon'],
            defaultNetwork: 'polygon',
            recipientAddress: walletAddress
        },
        ...overrides
    };
};
/**
 * Validate Ad402 configuration
 */
export const validateConfig = (config) => {
    const errors = [];
    if (!config.websiteId) {
        errors.push({
            code: 'MISSING_WEBSITE_ID',
            message: 'websiteId is required'
        });
    }
    if (!config.walletAddress) {
        errors.push({
            code: 'MISSING_WALLET_ADDRESS',
            message: 'walletAddress is required'
        });
    }
    else if (!isValidWalletAddress(config.walletAddress)) {
        errors.push({
            code: 'INVALID_WALLET_ADDRESS',
            message: 'walletAddress must be a valid Ethereum address (0x...)'
        });
    }
    if (config.apiBaseUrl && !isValidUrl(config.apiBaseUrl)) {
        errors.push({
            code: 'INVALID_API_URL',
            message: 'apiBaseUrl must be a valid URL'
        });
    }
    if (config.theme?.primaryColor && !isValidColor(config.theme.primaryColor)) {
        errors.push({
            code: 'INVALID_PRIMARY_COLOR',
            message: 'primaryColor must be a valid hex color'
        });
    }
    return errors;
};
/**
 * Check if a URL is valid
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Check if a color is valid
 */
export const isValidColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};
/**
 * Check if a wallet address is valid (Ethereum format)
 */
export const isValidWalletAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
/**
 * Format price for display
 */
export const formatPrice = (price, currency = 'USDC') => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice))
        return price;
    if (numPrice < 0.01) {
        return `${price} ${currency}`;
    }
    return `${numPrice.toFixed(2)} ${currency}`;
};
/**
 * Format time remaining
 */
export const formatTimeRemaining = (expiresAt) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0)
        return 'Expired';
    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
};
/**
 * Generate checkout URL
 */
export const generateCheckoutUrl = (slotId, price, size, websiteId, walletAddress, apiBaseUrl = 'https://ad402.io', additionalParams) => {
    const params = new URLSearchParams({
        slotId,
        price,
        size,
        websiteId,
        walletAddress,
        ...additionalParams
    });
    return `${apiBaseUrl}/checkout?${params.toString()}`;
};
/**
 * Generate upload URL
 */
export const generateUploadUrl = (slotId, price, size, websiteId, walletAddress, apiBaseUrl = 'https://ad402.io', additionalParams) => {
    const params = new URLSearchParams({
        slotId,
        price,
        size,
        websiteId,
        walletAddress,
        ...additionalParams
    });
    return `${apiBaseUrl}/upload?${params.toString()}`;
};
/**
 * Fetch ad data from API
 */
export const fetchAdData = async (slotId, apiBaseUrl = 'https://ad402.io') => {
    const response = await fetch(`${apiBaseUrl}/api/ads/${slotId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ad data: ${response.status}`);
    }
    return response.json();
};
/**
 * Fetch queue info from API
 */
export const fetchQueueInfo = async (slotId, apiBaseUrl = 'https://ad402.io') => {
    const response = await fetch(`${apiBaseUrl}/api/queue-info/${slotId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch queue info: ${response.status}`);
    }
    return response.json();
};
/**
 * Create a custom hook for ad data
 */
export const createAdDataHook = (slotId, apiBaseUrl = 'https://ad402.io') => {
    return {
        fetchAdData: () => fetchAdData(slotId, apiBaseUrl),
        fetchQueueInfo: () => fetchQueueInfo(slotId, apiBaseUrl)
    };
};
/**
 * Generate unique slot ID
 */
export const generateSlotId = (prefix = 'slot') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
};
/**
 * Parse slot configuration from URL parameters
 */
export const parseSlotConfigFromUrl = () => {
    if (typeof window === 'undefined')
        return {};
    const params = new URLSearchParams(window.location.search);
    const config = {};
    if (params.get('websiteId')) {
        config.websiteId = params.get('websiteId');
    }
    if (params.get('apiBaseUrl')) {
        config.apiBaseUrl = params.get('apiBaseUrl');
    }
    return config;
};
/**
 * Track ad events
 */
export const trackAdEvent = (event, slotId, websiteId, additionalData) => {
    if (typeof window === 'undefined')
        return;
    // Send to analytics endpoint
    fetch('https://ad402.io/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event,
            slotId,
            websiteId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...additionalData
        })
    }).catch(error => {
        console.warn('Failed to track ad event:', error);
    });
};
