// lib/adAnalytics.ts
export class AdAnalytics {
  static async trackAdView(slotIndex: string, ipfsHash: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex,
          ipfsHash,
          timestamp: Date.now(),
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          url: typeof window !== 'undefined' ? window.location.href : ''
        })
      });
    } catch (error) {
      console.error('Failed to track ad view:', error);
    }
  }

  static async trackAdClick(slotIndex: string, ipfsHash: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex,
          ipfsHash,
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : ''
        })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  }

  static async trackAdError(slotIndex: string, error: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex,
          error,
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : ''
        })
      });
    } catch (err) {
      console.error('Failed to track ad error:', err);
    }
  }
}
