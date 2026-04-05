import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { Header } from "@/components/Header";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AD-402 — Decentralized Advertising Protocol",
  description:
    "The open advertising standard for AI agents and humans. Publishers monetize. Advertisers reach. Any payment rail. Anywhere.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body
        className={cn(
          "grain min-h-screen bg-background font-sans antialiased",
        )}
      >
        <ClientProviders>
          <Header />
          <main>
            {children}
          </main>
        </ClientProviders>
        <ToastContainer />
      </body>
    </html>
  );
}
