"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { useLobbyStore } from "@/lib/lobby-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Target, TrendingUp, Home, Coins, TrendingDown, DollarSign, Edit } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useWalletAuth, updateUserProfile } from "@/lib/wallet-auth"
import { UsernameDialog } from "@/components/username-dialog"

export default function ProfilePage() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const { rooms } = useLobbyStore()
  const { user, refreshUser } = useWalletAuth()
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    totalGames: 0,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
  })

  useEffect(() => {
    if (!connected) {
      router.push("/")
      return
    }

    if (publicKey) {
      const finishedRooms = rooms.filter((r) => r.status === "finished")
      const wins = finishedRooms.filter((r) => r.winner === publicKey.toString()).length
      const losses = finishedRooms.filter(
        (r) => r.players.some((p) => p.wallet === publicKey.toString()) && r.winner !== publicKey.toString(),
      ).length

      let totalWagered = 0
      let totalWon = 0
      let totalLost = 0

      finishedRooms.forEach((room) => {
        const isParticipant = room.players.some((p) => p.wallet === publicKey.toString())
        if (isParticipant && room.roomType === "paid" && room.betAmount) {
          totalWagered += room.betAmount
          if (room.winner === publicKey.toString()) {
            // Winner gets 95% of pot (2x bet amount * 0.95)
            totalWon += room.betAmount * 2 * 0.95
          } else {
            totalLost += room.betAmount
          }
        }
      })

      setStats({
        wins,
        losses,
        totalGames: wins + losses,
        totalWagered,
        totalWon,
        totalLost,
      })
    }
  }, [connected, publicKey, rooms, router])

  const handleUsernameSubmit = async (username: string) => {
    if (!publicKey) return

    console.log("[v0] Updating username to:", username)
    const success = await updateUserProfile(publicKey.toString(), { username })
    if (success) {
      console.log("[v0] Username updated successfully, refreshing...")
      await refreshUser()

      await new Promise((resolve) => setTimeout(resolve, 500))

      setShowUsernameDialog(false)

      window.location.reload()
    } else {
      throw new Error("Failed to update username")
    }
  }

  if (!connected) return null

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : "0.0"
  const netPNL = stats.totalWon - stats.totalLost

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4120_1px,transparent_1px),linear-gradient(to_bottom,#00ff4120_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black game-title mb-2">Player Profile</h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-green-400 text-xl game-text">{user?.username || "Loading..."}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsernameDialog(true)}
              className="text-green-400 hover:text-lime-400 hover:bg-green-500/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-green-400/60 text-sm">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-6)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-green-400/60">Wins</p>
                <p className="text-3xl font-bold text-green-400">{stats.wins}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30 p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-red-400/60">Losses</p>
                <p className="text-3xl font-bold text-red-400">{stats.losses}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-lime-500/10 border-yellow-500/30 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-yellow-400/60">Win Rate</p>
                <p className="text-3xl font-bold text-yellow-400">{winRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-black/70 backdrop-blur border-green-500/30 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 game-text">Profit & Loss</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-400/60 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Total Wagered
                </span>
                <span className="text-white font-bold">
                  {stats.totalWagered.toFixed(4)} {siteConfig.token.ticker}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400/60 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Total Won
                </span>
                <span className="text-green-400 font-bold">
                  {stats.totalWon.toFixed(4)} {siteConfig.token.ticker}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400/60 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Total Lost
                </span>
                <span className="text-red-400 font-bold">
                  {stats.totalLost.toFixed(4)} {siteConfig.token.ticker}
                </span>
              </div>
            </div>
            <Card
              className={`p-6 ${netPNL >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className={`w-10 h-10 ${netPNL >= 0 ? "text-green-400" : "text-red-400"}`} />
                <div>
                  <p className={`text-sm ${netPNL >= 0 ? "text-green-400/60" : "text-red-400/60"}`}>Net P&L</p>
                  <p className={`text-3xl font-bold ${netPNL >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {netPNL >= 0 ? "+" : ""}
                    {netPNL.toFixed(4)} {siteConfig.token.ticker}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        <Card className="bg-black/70 backdrop-blur border-green-500/30 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 game-text">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-400/60">Total Games</span>
              <span className="text-green-400 font-bold">{stats.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400/60">Wins</span>
              <span className="text-green-400 font-bold">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400/60">Losses</span>
              <span className="text-red-400 font-bold">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400/60">Win Rate</span>
              <span className="text-yellow-400 font-bold">{winRate}%</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={() => router.push("/lobby")}
          className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
      </div>

      <UsernameDialog
        open={showUsernameDialog}
        onOpenChange={setShowUsernameDialog}
        onSubmit={handleUsernameSubmit}
        currentUsername={user?.username}
        isFirstTime={false}
      />
    </div>
  )
}
