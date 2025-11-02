"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { siteConfig } from "@/lib/config"

export function WalletConnector() {
  const { publicKey, connecting, disconnecting } = useWallet()
  const { connection } = useConnection()
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
    // Update balance every 5 seconds
    intervalId = setInterval(updateBalance, 5000)

    return () => clearInterval(intervalId)
  }, [publicKey, connection])

  const isLoading = connecting || disconnecting

  return (
    <div className="w-full">
      {!publicKey ? (
        <Card className="bg-slate-900/50 backdrop-blur border-purple-500/20 p-8 text-center">
          <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-slate-400 mb-6">Connect your Solana wallet to start betting on fights</p>
          <WalletMultiButton
            className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !font-bold !px-8 !py-3 !rounded-lg !transition-all !mx-auto"
            disabled={isLoading}
          />
          {isLoading && <p className="text-sm text-slate-400 mt-4">Connecting to wallet...</p>}
        </Card>
      ) : (
        <Card className="bg-slate-900/50 backdrop-blur border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Connected Wallet</p>
                <p className="text-white font-mono text-sm">
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-6)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 flex items-center gap-1 justify-end">Balance</p>
              <p className="text-xl font-bold text-yellow-400">
                {balance !== null ? `${balance.toFixed(4)} ${siteConfig.token.ticker}` : "Loading..."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
