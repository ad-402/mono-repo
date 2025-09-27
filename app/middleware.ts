import { url } from 'inspector';
import { paymentMiddleware } from 'x402-next';

export const middleware = paymentMiddleware(
  "0x3c11A511598fFD31fE4f6E3BdABcC31D99C1bD10", // Replace with your actual wallet address
  {
    '/ads/[slotId]': {
      price: '$0.01', // Set the price for ad submission
      network: "polygon-amoy", // Choose the appropriate network
      config: {
        description: 'Payment for ad submission',
      },
    },
    url: 'https://polygon-facilitator.vercel.app',
  }
);

export const config = {
  matcher: ['/ads/:path*'],
};