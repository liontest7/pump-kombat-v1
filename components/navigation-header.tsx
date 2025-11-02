"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Home, Users, Shield, Swords, Settings, ShoppingCart } from "lucide-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { siteConfig } from "@/lib/config"
import { isAdmin } from "@/lib/adminUtils"

export function NavigationHeader() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const pathname = usePathname()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const updateBalance = async () => {
      if (publicKey) {
        try {
          const bal = await connection.getBalance(publicKey)
          setBalance(bal / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Failed to fetch balance:", error)
        }
      } else {
        setBalance(null)
      }
    }

    updateBalance()
    intervalId = setInterval(updateBalance, 5000)

    return () => clearInterval(intervalId)
  }, [publicKey, connection, pathname])

  if (pathname?.startsWith("/fight")) return null

  const isAdminUser = publicKey ? isAdmin(publicKey.toString()) : false

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-green-500/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Swords className="w-6 h-6 text-green-400" />
            <span className="text-xl font-black bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
              PUMP KOMBAT
            </span>
          </button>

          {connected && (
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className={pathname === "/" ? "text-green-400" : "text-slate-400 hover:text-green-300"}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/lobby")}
                className={pathname === "/lobby" ? "text-green-400" : "text-slate-400 hover:text-green-300"}
              >
                <Users className="w-4 h-4 mr-2" />
                Lobby
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/profile")}
                className={pathname === "/profile" ? "text-green-400" : "text-slate-400 hover:text-green-300"}
              >
                <Shield className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/about")}
                className={pathname === "/about" ? "text-green-400" : "text-slate-400 hover:text-green-300"}
              >
                About
              </Button>
              {isAdminUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin")}
                  className={
                    pathname === "/admin"
                      ? "text-yellow-400 border border-yellow-400/50 bg-yellow-400/10"
                      : "text-yellow-400/70 hover:text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10"
                  }
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {balance !== null && (
              <div className="flex items-center gap-2 bg-black/70 border border-green-500/30 rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-green-400">
                  {balance.toFixed(4)} {siteConfig.token.ticker}
                </span>
              </div>
            )}
            {connected && (
              <Button
                size="sm"
                onClick={() => window.open(siteConfig.buy.pumpFun, "_blank")}
                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold border border-green-400/30"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Tokens
              </Button>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-green-600 !to-lime-600 hover:!from-green-700 hover:!to-lime-700 !text-black !font-bold !px-4 !py-2 !rounded-lg !transition-all !text-sm" />
          </div>
        </div>
      </div>
    </header>
  )
}
