// 2. components/Providers.tsx
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy } from "wagmi/chains";

// Create a stable config instance
const config = getDefaultConfig({
  appName: "X402 USDC Checkout",
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "ad402-project",
  chains: [polygonAmoy, polygon], // Polygon Amoy (testnet) and Polygon Mainnet
  ssr: true,
});

const Providers = ({ children }: { children: ReactNode }) => {
  // Create a stable query client instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export { Providers };