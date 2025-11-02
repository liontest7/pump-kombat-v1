"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useLobbyStore } from "@/lib/lobby-store"
import { fighters } from "@/lib/fighters"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Coins, CheckCircle, Copy, Home, X } from "lucide-react"
import { useState } from "react"

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { rooms } = useLobbyStore()
  const [copiedSeed, setCopiedSeed] = useState(false)

  const roomId = params.id as string
  const room = rooms.find((r) => r.id === roomId)

  useEffect(() => {
    if (!connected || !room) {
      router.push("/lobby")
      return
    }

    if (room.status !== "finished") {
      router.push(`/room/${roomId}`)
      return
    }
  }, [connected, room, roomId, router])

  if (!room) return null

  const currentUserWallet = publicKey?.toString()
  const isWinner = room.winner === currentUserWallet
  const winnerPlayer = room.players.find((p) => p.wallet === room.winner)
  const loserPlayer = room.players.find((p) => p.wallet !== room.winner)
  const winnerFighter = fighters.find((f) => f.name === winnerPlayer?.fighter)
  const loserFighter = fighters.find((f) => f.name === loserPlayer?.fighter)

  const totalPot = room.betAmount * 2
  const platformFee = totalPot * 0.05
  const winnerPayout = totalPot - platformFee

  const copySeed = () => {
    if (room.seed) {
      navigator.clipboard.writeText(room.seed)
      setCopiedSeed(true)
      setTimeout(() => setCopiedSeed(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-32 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4 game-title">{isWinner ? "VICTORY!" : "DEFEAT!"}</h1>
          <p className="text-3xl text-white font-bold mb-6">{isWinner ? "You Win!" : "You Lose!"}</p>

          <div className="flex justify-center mb-6">
            {isWinner ? (
              <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
            ) : (
              <X className="w-24 h-24 text-red-400" />
            )}
          </div>

          {isWinner && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              You Won!
            </Badge>
          )}
          {!isWinner && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-lg px-4 py-2">You Lost</Badge>
          )}
        </div>

        {/* Fight Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Winner Card */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 p-6">
            <div className="text-center space-y-4">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
              <div className="text-6xl">{winnerFighter?.avatar}</div>
              <h3 className="text-2xl font-bold text-yellow-400">{winnerFighter?.name}</h3>
              <p className="text-sm text-slate-400">
                {winnerPlayer?.wallet.slice(0, 8)}...{winnerPlayer?.wallet.slice(-6)}
              </p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Winner</Badge>
            </div>
          </Card>

          {/* Loser Card */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700 p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-50">{loserFighter?.avatar}</div>
              <h3 className="text-2xl font-bold text-slate-400">{loserFighter?.name}</h3>
              <p className="text-sm text-slate-500">
                {loserPlayer?.wallet.slice(0, 8)}...{loserPlayer?.wallet.slice(-6)}
              </p>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Defeated</Badge>
            </div>
          </Card>
        </div>

        {/* Payout Information */}
        <Card className="bg-slate-900/50 backdrop-blur border-green-500/20 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            Payout Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Pot:</span>
              <span className="text-white font-medium">{totalPot} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Platform Fee (5%):</span>
              <span className="text-yellow-400 font-medium">-{platformFee.toFixed(4)} SOL</span>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Winner Receives:</span>
                <span className="text-green-400 font-bold text-xl">{winnerPayout.toFixed(4)} SOL</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Provably Fair Verification */}
        <Card className="bg-slate-900/50 backdrop-blur border-green-500/20 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Provably Fair Verification</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Fight Seed:</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-slate-800 text-green-400 px-3 py-2 rounded text-sm font-mono break-all">
                  {room.seed}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySeed}
                  className="border-slate-700 hover:bg-slate-800 bg-transparent"
                >
                  {copiedSeed ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              This seed was generated before the fight and can be used to verify the fairness of the outcome. The fight
              result is deterministic based on this seed and fighter stats.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/lobby")}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Lobby
          </Button>
        </div>
      </div>
    </div>
  )
}
