/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP and per wallet
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const ipRateLimits = new Map<string, RateLimitEntry>();
const walletRateLimits = new Map<string, RateLimitEntry>();

// Rate limit configurations
export const RATE_LIMITS = {
  // Requests per window
  IP_LIMIT: 100, // 100 requests per 15 minutes per IP
  WALLET_LIMIT: 50, // 50 requests per 15 minutes per wallet
  UPLOAD_LIMIT: 10, // 10 uploads per hour per wallet

  // Time windows in milliseconds
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();

  // Clean IP limits
  Array.from(ipRateLimits.entries()).forEach(([ip, entry]) => {
    if (entry.resetTime < now) {
      ipRateLimits.delete(ip);
    }
  });

  // Clean wallet limits
  Array.from(walletRateLimits.entries()).forEach(([wallet, entry]) => {
    if (entry.resetTime < now) {
      walletRateLimits.delete(wallet);
    }
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for IP (in order of reliability)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (cfConnectingIp) return cfConnectingIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Check and update rate limit for an identifier
 */
function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    const resetTime = now + windowMs;
    store.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}

/**
 * Rate limit middleware for IP addresses
 */
export async function rateLimitByIP(
  request: NextRequest,
  limit: number = RATE_LIMITS.IP_LIMIT,
  windowMs: number = RATE_LIMITS.WINDOW_MS
): Promise<NextResponse | null> {
  const ip = getClientIp(request);

  if (ip === 'unknown') {
    console.warn('Could not determine client IP for rate limiting');
    return null; // Allow request but log warning
  }

  const result = checkRateLimit(ipRateLimits, ip, limit, windowMs);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP address',
        retryAfter: `${retryAfter} seconds`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      }
    );
  }

  // Request allowed, add rate limit headers to response
  return null; // null means allow the request to proceed
}

/**
 * Rate limit middleware for wallet addresses
 */
export async function rateLimitByWallet(
  walletAddress: string,
  limit: number = RATE_LIMITS.WALLET_LIMIT,
  windowMs: number = RATE_LIMITS.WINDOW_MS
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const normalizedWallet = walletAddress.toLowerCase();
  const result = checkRateLimit(walletRateLimits, normalizedWallet, limit, windowMs);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests from this wallet address',
          retryAfter: `${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Combined rate limiting for API routes
 * Checks both IP and wallet (if provided)
 */
export async function applyRateLimit(
  request: NextRequest,
  options?: {
    ipLimit?: number;
    walletLimit?: number;
    windowMs?: number;
    walletAddress?: string;
  }
): Promise<NextResponse | null> {
  // Check IP rate limit first
  const ipResult = await rateLimitByIP(
    request,
    options?.ipLimit,
    options?.windowMs
  );

  if (ipResult) {
    return ipResult; // Rate limit exceeded
  }

  // Check wallet rate limit if wallet provided
  if (options?.walletAddress) {
    const walletResult = await rateLimitByWallet(
      options.walletAddress,
      options?.walletLimit,
      options?.windowMs
    );

    if (!walletResult.allowed) {
      return walletResult.response!;
    }
  }

  return null; // All checks passed
}

/**
 * Get rate limit info for monitoring
 */
export function getRateLimitInfo(identifier: string, type: 'ip' | 'wallet'): {
  count: number;
  resetTime: number | null;
} {
  const store = type === 'ip' ? ipRateLimits : walletRateLimits;
  const entry = store.get(identifier.toLowerCase());

  if (!entry) {
    return { count: 0, resetTime: null };
  }

  return { count: entry.count, resetTime: entry.resetTime };
}

/**
 * Reset rate limit for an identifier (useful for testing or admin actions)
 */
export function resetRateLimit(identifier: string, type: 'ip' | 'wallet'): void {
  const store = type === 'ip' ? ipRateLimits : walletRateLimits;
  store.delete(identifier.toLowerCase());
}
