'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
// Create the context
const Ad402Context = createContext(null);
// Provider component
export const Ad402Provider = ({ config, children }) => {
    const [error, setError] = useState(null);
    // Validate configuration
    useEffect(() => {
        if (!config.websiteId) {
            setError({
                code: 'MISSING_WEBSITE_ID',
                message: 'websiteId is required in Ad402Config'
            });
            return;
        }
        if (!config.walletAddress) {
            setError({
                code: 'MISSING_WALLET_ADDRESS',
                message: 'walletAddress is required in Ad402Config'
            });
            return;
        }
        // Basic wallet address validation (Ethereum address format)
        if (!/^0x[a-fA-F0-9]{40}$/.test(config.walletAddress)) {
            setError({
                code: 'INVALID_WALLET_ADDRESS',
                message: 'walletAddress must be a valid Ethereum address (0x...)'
            });
            return;
        }
        // Reset error if config is valid
        setError(null);
    }, [config]);
    // Default configuration values
    const defaultConfig = {
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
            recipientAddress: config.walletAddress // Use the provided wallet address
        },
        ...config
    };
    const contextValue = {
        config: defaultConfig,
        apiBaseUrl: defaultConfig.apiBaseUrl || 'https://ad402.io'
    };
    // If there's a configuration error, show it
    if (error) {
        return (_jsxs("div", { style: {
                padding: '16px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#c00'
            }, children: [_jsx("strong", { children: "Ad402 Configuration Error:" }), " ", error.message] }));
    }
    return (_jsx(Ad402Context.Provider, { value: contextValue, children: children }));
};
// Hook to use the context
export const useAd402Context = () => {
    const context = useContext(Ad402Context);
    if (!context) {
        throw new Error('useAd402Context must be used within an Ad402Provider');
    }
    return context;
};
// Hook to get configuration
export const useAd402Config = () => {
    const { config } = useAd402Context();
    return config;
};
// Hook to get API base URL
export const useAd402Api = () => {
    const { apiBaseUrl } = useAd402Context();
    return apiBaseUrl;
};
