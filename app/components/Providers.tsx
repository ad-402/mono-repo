// 2. components/Providers.tsx
"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy } from "wagmi/chains";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "X402 USDC Checkout",
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID ?? "",
  chains: [polygonAmoy, polygon], // Polygon Amoy (testnet) and Polygon Mainnet
  ssr: true,
});

const Providers = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export { Providers };