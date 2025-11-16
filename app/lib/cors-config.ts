/**
 * CORS Configuration
 * Centralized CORS settings for API routes
 */

import { NextResponse } from 'next/server';

// Allowed origins for CORS
// In production, replace with your actual domains
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://ad402.io',
      'https://www.ad402.io',
      'https://ad402.vercel.app',
    ];

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // Allow all localhost origins in development
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS headers for a response
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Set origin based on whitelist
  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (process.env.NODE_ENV === 'development') {
    // In development, be more permissive but log
    console.warn(`CORS: Origin not in whitelist: ${origin}`);
    headers['Access-Control-Allow-Origin'] = origin || '*';
  } else {
    // In production, deny unknown origins
    headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0] || 'https://ad402.io';
  }

  return headers;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(request: Request): NextResponse {
  const origin = request.headers.get('origin');
  const headers = getCorsHeaders(origin);

  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get('origin');
  const headers = getCorsHeaders(origin);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Wrap an API handler with CORS support
 */
export function withCors(
  handler: (request: Request) => Promise<NextResponse> | NextResponse
) {
  return async (request: Request): Promise<NextResponse> => {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Execute handler
    const response = await handler(request);

    // Add CORS headers
    return addCorsHeaders(response, request);
  };
}
