import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "@/components/sound-context"
import { MuteButton } from "@/components/mute-button"
import { SolanaWalletProvider } from "@/components/wallet-provider"
import { NavigationHeader } from "@/components/navigation-header"

export const metadata: Metadata = {
  title: "PUMP KOMBAT - Solana Fighting Arena",
  description:
    "The ultimate Solana-powered fighting arena. Bet on epic battles, win big rewards, and prove your combat supremacy.",
  manifest: "/manifest.json",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <SolanaWalletProvider>
            <SoundProvider>
              <MuteButton />
              <NavigationHeader />
              <main className="flex min-h-screen flex-col pt-4">{children}</main>
            </SoundProvider>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
