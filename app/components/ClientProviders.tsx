"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const Providers = dynamic(
  () => import("@/components/Providers").then((m) => m.Providers),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
