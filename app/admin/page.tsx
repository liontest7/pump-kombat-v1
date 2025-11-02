"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLobbyStore } from "@/lib/lobby-store"
import { Coins, Users, TrendingUp, Activity, Eye, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { isAdmin } from "@/lib/adminUtils"

export default function AdminPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const { rooms } = useLobbyStore()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!connected || !publicKey) {
      router.push("/")
      return
    }

    const authorized = isAdmin(publicKey.toString())
    if (!authorized) {
      router.push("/")
      return
    }

    setIsAuthorized(true)
  }, [connected, publicKey, router])

  if (!connected || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4108_1px,transparent_1px),linear-gradient(to_bottom,#00ff4108_1px,transparent_1px)] bg-[size:40px_40px]" />
        <Card className="relative z-10 bg-black/80 backdrop-blur border-red-500/30 p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 game-text-white">Access Denied</h2>
          <p className="text-green-400 mb-6 game-text">You do not have permission to access the admin panel.</p>
          <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700 text-black font-bold">
            Return to Home
          </Button>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const totalRooms = rooms.length
  const activeRooms = rooms.filter((r) => r.status === "waiting" || r.status === "ready").length
  const completedRooms = rooms.filter((r) => r.status === "finished").length
  const rankedRooms = rooms.filter((r) => r.roomType === "ranked")
  const totalVolume = rankedRooms.reduce((sum, room) => sum + room.betAmount * room.players.length, 0)
  const totalFees = rankedRooms
    .filter((r) => r.status === "finished")
    .reduce((sum, room) => sum + room.betAmount * 2 * 0.05, 0)

  const selectedRoomData = selectedRoom ? rooms.find((r) => r.id === selectedRoom) : null

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4108_1px,transparent_1px),linear-gradient(to_bottom,#00ff4108_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white game-title">Admin Dashboard</h1>
          <p className="text-green-400 mt-1 game-text">Monitor platform activity and transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm game-text">Total Rooms</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalRooms}</p>
            <p className="text-xs text-green-400/70 mt-1 game-text">{activeRooms} active</p>
          </Card>

          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm game-text">Completed Fights</span>
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{completedRooms}</p>
            <p className="text-xs text-green-400/70 mt-1 game-text">{completedRooms * 2} total players</p>
          </Card>

          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm game-text">Total Volume</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalVolume.toFixed(2)}</p>
            <p className="text-xs text-green-400/70 mt-1 game-text">TOKENS wagered</p>
          </Card>

          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm game-text">Platform Fees</span>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalFees.toFixed(4)}</p>
            <p className="text-xs text-green-400/70 mt-1 game-text">TOKENS earned (5%)</p>
          </Card>
        </div>

        {/* Rooms Table */}
        <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 game-text-white">All Rooms</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Room Name</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Type</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Status</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Bet Amount</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Players</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Created</th>
                  <th className="text-left text-green-400 font-medium pb-3 px-2 game-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-green-400/50 game-text">
                      No rooms created yet
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                      <td className="py-4 px-2">
                        <span className="text-white font-medium">{room.name}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant="outline"
                          className={
                            room.roomType === "free"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                          }
                        >
                          {room.roomType === "free" ? "Practice" : "Ranked"}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant="outline"
                          className={
                            room.status === "waiting"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : room.status === "fighting"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : room.status === "finished"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={
                            room.roomType === "free" ? "text-blue-400 font-medium" : "text-yellow-400 font-medium"
                          }
                        >
                          {room.roomType === "free" ? "FREE" : `${room.betAmount} TOKENS`}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-green-400">{room.players.length}/2</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-green-400/70 text-sm">{new Date(room.createdAt).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Room Details Modal */}
        {selectedRoomData && (
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white game-text-white">Room Details: {selectedRoomData.name}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRoom(null)}
                className="text-green-400 hover:text-white"
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-green-400 block mb-1 game-text">Room ID:</label>
                  <code className="text-xs text-green-400 bg-black/50 px-2 py-1 rounded block break-all border border-green-500/20">
                    {selectedRoomData.id}
                  </code>
                </div>
                <div>
                  <label className="text-sm text-green-400 block mb-1 game-text">Creator:</label>
                  <code className="text-xs text-green-400 bg-black/50 px-2 py-1 rounded block break-all border border-green-500/20">
                    {selectedRoomData.creator}
                  </code>
                </div>
                <div>
                  <label className="text-sm text-green-400 block mb-1 game-text">Room Type:</label>
                  <Badge
                    className={
                      selectedRoomData.roomType === "free"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }
                  >
                    {selectedRoomData.roomType === "free" ? "Practice Mode" : "Ranked Match"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-green-400 block mb-1 game-text">Status:</label>
                  <Badge
                    className={
                      selectedRoomData.status === "finished"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {selectedRoomData.status}
                  </Badge>
                </div>
              </div>

              {/* Players */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white game-text-white">Players:</h4>
                {selectedRoomData.players.map((player, index) => (
                  <div key={player.wallet} className="bg-black/50 border border-green-500/20 rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-400 game-text">
                        Player {index + 1} {player.wallet.startsWith("BOT_") && "(AI Bot)"}
                      </span>
                      {selectedRoomData.winner === player.wallet && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Winner</Badge>
                      )}
                    </div>
                    <code className="text-xs text-green-400/70 block break-all">{player.wallet}</code>
                    {player.fighter && <p className="text-sm text-green-400 game-text">Fighter: {player.fighter}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Fight Details - Only show for ranked rooms */}
            {selectedRoomData.status === "finished" &&
              selectedRoomData.roomType === "ranked" &&
              selectedRoomData.seed && (
                <div className="mt-6 pt-6 border-t border-green-500/20">
                  <h4 className="text-sm font-semibold text-white mb-3 game-text-white">Fight Details:</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-green-400 block mb-1 game-text">Provably Fair Seed:</label>
                      <code className="text-xs text-green-400 bg-black/50 px-2 py-1 rounded block break-all border border-green-500/20">
                        {selectedRoomData.seed}
                      </code>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-400 block game-text">Total Pot:</span>
                        <span className="text-white font-medium">
                          {(selectedRoomData.betAmount * 2).toFixed(4)} TOKENS
                        </span>
                      </div>
                      <div>
                        <span className="text-green-400 block game-text">Platform Fee:</span>
                        <span className="text-yellow-400 font-medium">
                          {(selectedRoomData.betAmount * 2 * 0.05).toFixed(4)} TOKENS
                        </span>
                      </div>
                      <div>
                        <span className="text-green-400 block game-text">Winner Payout:</span>
                        <span className="text-green-400 font-medium">
                          {(selectedRoomData.betAmount * 2 * 0.95).toFixed(4)} TOKENS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </Card>
        )}
      </div>
    </div>
  )
}
