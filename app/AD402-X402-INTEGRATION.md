# Ad402 x402 Integration

This document explains how the Ad402 platform integrates with x402 for payment processing in the ad bidding flow.

## Overview

The integration allows users to:
1. Click on ad slots to view details and place bids
2. Make payments using x402 before submitting ads
3. Complete ad submissions after successful payment

## Flow

### 1. Ad Slot Display
- Ad slots are displayed using the `Ad402Slot` component
- Users can click on slots to place bids
- The component now includes a `clickable` prop for controlling click behavior

### 2. Payment-Protected Ad Submission (`/ads/[slotId]`)
- **Protected by x402 middleware** requiring payment before access
- Users must pay $0.01 USDC on Base Sepolia network
- After successful payment, users see the ad submission form directly
- No separate details page - payment happens first, then form
- Form includes all necessary fields for ad placement

## Configuration

### Middleware Setup
The `middleware.ts` file configures x402 payment protection:

```typescript
export const middleware = paymentMiddleware(
  "0x3c11A511598fFD31fE4f6E3BdABcC31D99C1bD10", // Receiving wallet
  {
    '/ads': {
      price: '$0.01',
      network: "base-sepolia",
      config: {
        description: 'Payment for ad submission',
      },
    },
  }
);
```

### Environment Variables
Make sure to set up your environment variables for:
- Lighthouse API key for IPFS storage
- Wallet addresses
- Network configuration

See `LIGHTHOUSE-SETUP.md` for detailed setup instructions.

## API Routes

### New Routes Added:
- `GET /api/ad-slots/[slotId]` - Fetch individual ad slot details
- `POST /api/ad-submissions` - Create ad submission with Lighthouse file upload (replaces Prisma-based route)

## Components

### Updated Components:
- `Ad402Slot` - Now clickable and redirects to payment-protected submission page
- Added click handling and visual feedback

### New Components:
- Payment-protected ad submission form (replaces separate details page)
- Test page for demonstration

## Testing

Visit these test pages:
- `/test-ads` - View existing ad slots and test the complete bidding flow
- `/test-upload` - Test Lighthouse IPFS file upload functionality

## Usage Example

```tsx
// Display a clickable ad slot
<Ad402Slot
  slotId="slot-123"
  size="banner"
  price="0.10"
  durations={['30m', '1h', '6h', '24h']}
  category="technology"
  clickable={true}
/>
```

When users click on the slot, they'll be redirected to `/ads/slot-123` which requires x402 payment before allowing ad submission. After successful payment, users see the ad submission form directly.

## Dependencies

- `x402-next`: For payment processing
- `@lighthouse-web3/sdk`: For IPFS file storage
- `react-hook-form`: For form handling
- `@hookform/resolvers`: For form validation
- `zod`: For schema validation

## Network Configuration

Currently configured for:
- Network: Base Sepolia testnet
- Currency: USDC
- Price: $0.01 per ad submission

Update the middleware configuration to change these settings.
