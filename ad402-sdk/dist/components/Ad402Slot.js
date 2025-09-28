'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAd402Context } from './Ad402Provider';
// Default slot dimensions
const SLOT_DIMENSIONS = {
    banner: { width: 728, height: 90 },
    square: { width: 300, height: 250 },
    mobile: { width: 320, height: 60 },
    sidebar: { width: 160, height: 600 }
};
// Default font sizes based on slot dimensions
const getOptimalFontSizes = (width, height) => {
    const baseSize = Math.min(width, height);
    return {
        icon: Math.max(12, baseSize * 0.08),
        title: Math.max(10, baseSize * 0.06),
        subtitle: Math.max(8, baseSize * 0.05),
        small: Math.max(6, baseSize * 0.04)
    };
};
// Default loading component
const DefaultLoadingComponent = () => (_jsx("div", { style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        color: '#666'
    }, children: "Loading..." }));
// Default error component
const DefaultErrorComponent = ({ error }) => (_jsxs("div", { style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#c00',
        textAlign: 'center',
        padding: '8px'
    }, children: ["Error: ", error.message] }));
// Default empty slot component
const DefaultEmptySlotComponent = ({ slotId, price, size, queueInfo, onClick, clickable, theme }) => {
    const dimensions = SLOT_DIMENSIONS[size];
    const fontSizes = getOptimalFontSizes(dimensions.width, dimensions.height);
    return (_jsxs("div", { onClick: clickable ? onClick : undefined, style: {
            width: '100%',
            height: '100%',
            border: `2px dashed ${theme.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundColor,
            padding: '4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            cursor: clickable ? 'pointer' : 'default',
            fontFamily: theme.fontFamily,
            color: theme.textColor,
            transition: 'all 0.2s ease'
        }, onMouseEnter: (e) => {
            if (clickable) {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
        }, onMouseLeave: (e) => {
            if (clickable) {
                e.currentTarget.style.backgroundColor = theme.backgroundColor;
            }
        }, children: [_jsx("div", { style: { fontSize: fontSizes.icon, marginBottom: '2px', lineHeight: '1' }, children: "\uD83D\uDCB3" }), _jsxs("div", { style: { fontSize: fontSizes.title, fontWeight: '600', marginBottom: '1px', lineHeight: '1.1' }, children: ["Ad Slot: ", slotId] }), _jsxs("div", { style: { fontSize: fontSizes.subtitle, marginBottom: '1px', lineHeight: '1.1', color: '#666' }, children: [price, " USDC \u2022 ", size] }), queueInfo && !queueInfo.isAvailable && (_jsxs("div", { style: { fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: theme.primaryColor, fontWeight: 'bold' }, children: [queueInfo.totalInQueue, " in queue"] })), _jsx("div", { style: { fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: '#666' }, children: "Polygon USDC" }), clickable && (_jsx("div", { style: { fontSize: fontSizes.small, lineHeight: '1.1', color: '#666' }, children: queueInfo && !queueInfo.isAvailable ? 'Click to bid' : 'Click to purchase' }))] }));
};
export const Ad402Slot = ({ slotId, size = 'banner', price = '0.10', durations = ['30m', '1h', '6h', '24h'], category = 'general', className = '', clickable = true, dimensions: customDimensions, onSlotClick, onAdLoad, onAdError, loadingComponent, errorComponent, emptySlotComponent, ...props }) => {
    const { config, apiBaseUrl } = useAd402Context();
    const [adData, setAdData] = useState(null);
    const [queueInfo, setQueueInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const slotRef = useRef(null);
    // Get slot dimensions
    const slotDimensions = customDimensions || SLOT_DIMENSIONS[size];
    const fontSizes = getOptimalFontSizes(slotDimensions.width, slotDimensions.height);
    // Fetch ad data
    const fetchAdData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${apiBaseUrl}/api/ads/${slotId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ad data: ${response.status}`);
            }
            const data = await response.json();
            setAdData(data);
            if (data.hasAd && onAdLoad) {
                onAdLoad(data);
            }
        }
        catch (err) {
            const error = {
                code: 'FETCH_ERROR',
                message: err instanceof Error ? err.message : 'Failed to fetch ad data',
                details: err
            };
            setError(error);
            if (onAdError) {
                onAdError(err instanceof Error ? err : new Error('Failed to fetch ad data'));
            }
        }
        finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl, slotId, onAdLoad, onAdError]);
    // Fetch queue info
    const fetchQueueInfo = useCallback(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/queue-info/${slotId}`);
            if (response.ok) {
                const data = await response.json();
                setQueueInfo(data);
            }
        }
        catch (err) {
            console.warn('Failed to fetch queue info:', err);
        }
    }, [apiBaseUrl, slotId]);
    // Handle slot click
    const handleSlotClick = useCallback(() => {
        if (onSlotClick) {
            onSlotClick(slotId);
        }
        else {
            // Default behavior: redirect to checkout
            const params = new URLSearchParams({
                slotId,
                price,
                size,
                durations: durations.join(','),
                category,
                websiteId: config.websiteId,
                walletAddress: config.walletAddress
            });
            window.open(`${apiBaseUrl}/checkout?${params.toString()}`, '_blank');
        }
    }, [onSlotClick, slotId, price, size, durations, category, config.websiteId, config.walletAddress, apiBaseUrl]);
    // Initial data fetch
    useEffect(() => {
        fetchAdData();
        fetchQueueInfo();
    }, [fetchAdData, fetchQueueInfo]);
    // Set slot attributes for external tracking
    useEffect(() => {
        if (slotRef.current) {
            slotRef.current.setAttribute('data-slot-id', slotId);
            slotRef.current.setAttribute('data-size', size);
            slotRef.current.setAttribute('data-price', price);
            slotRef.current.setAttribute('data-durations', durations.join(','));
            slotRef.current.setAttribute('data-category', category);
            slotRef.current.setAttribute('data-website-id', config.websiteId);
        }
    }, [slotId, size, price, durations, category, config.websiteId]);
    // Loading state
    if (isLoading) {
        return (_jsx("div", { ref: slotRef, className: `ad402-slot ${className}`, style: {
                width: slotDimensions.width,
                height: slotDimensions.height,
                maxWidth: '100%',
                maxHeight: '100%',
                border: `2px solid ${config.theme?.borderColor}`,
                backgroundColor: config.theme?.backgroundColor,
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
                margin: '0 auto'
            }, children: loadingComponent || _jsx(DefaultLoadingComponent, {}) }));
    }
    // Error state
    if (error) {
        return (_jsx("div", { ref: slotRef, className: `ad402-slot ${className}`, style: {
                width: slotDimensions.width,
                height: slotDimensions.height,
                maxWidth: '100%',
                maxHeight: '100%',
                border: `2px solid ${config.theme?.borderColor}`,
                backgroundColor: config.theme?.backgroundColor,
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
                margin: '0 auto'
            }, children: errorComponent || _jsx(DefaultErrorComponent, { error: error }) }));
    }
    // Ad exists - show the ad
    if (adData?.hasAd && adData.contentUrl) {
        return (_jsxs("div", { style: { position: 'relative', display: 'inline-block' }, children: [_jsx("div", { ref: slotRef, className: `ad402-slot ${className}`, style: {
                        width: slotDimensions.width,
                        height: slotDimensions.height,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        border: `2px solid ${config.theme?.borderColor}`,
                        backgroundColor: config.theme?.backgroundColor,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        position: 'relative',
                        margin: '0 auto'
                    }, children: _jsx("img", { src: adData.contentUrl, alt: "Advertisement", style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer'
                        }, onClick: () => {
                            // Track ad click if needed
                            console.log(`Ad clicked: ${slotId}`);
                        }, onError: () => {
                            // If image fails to load, fall back to empty slot
                            setAdData({ hasAd: false });
                        } }) }), clickable && (_jsx("button", { onClick: handleSlotClick, style: {
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        minWidth: '24px',
                        height: '24px',
                        backgroundColor: config.theme?.primaryColor,
                        color: config.theme?.backgroundColor,
                        border: 'none',
                        borderRadius: config.theme?.borderRadius || 0,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: config.theme?.fontFamily,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        padding: queueInfo && queueInfo.totalInQueue > 0 ? '0 6px' : '0'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = `${config.theme?.primaryColor || '#000000'}dd`;
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = config.theme?.primaryColor || '#000000';
                        e.currentTarget.style.transform = 'scale(1)';
                    }, title: queueInfo && queueInfo.totalInQueue > 0
                        ? `Book next slot (${queueInfo.totalInQueue} in queue)`
                        : "Book next slot", children: queueInfo && queueInfo.totalInQueue > 0 ? queueInfo.totalInQueue : '+' }))] }));
    }
    // Empty slot - show purchase option
    return (_jsx("div", { ref: slotRef, className: `ad402-slot ${className}`, style: {
            width: slotDimensions.width,
            height: slotDimensions.height,
            maxWidth: '100%',
            maxHeight: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
            margin: '0 auto'
        }, children: emptySlotComponent || (_jsx(DefaultEmptySlotComponent, { slotId: slotId, price: price, size: size, queueInfo: queueInfo, onClick: handleSlotClick, clickable: clickable, theme: config.theme || {} })) }));
};
