"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Users,
  Coins,
  Clock,
  Swords,
  Wallet,
  AlertTriangle,
  Copy,
  CheckCircle,
  Eye,
  Grid3x3,
  List,
} from "lucide-react"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { UsernameDialog } from "@/components/username-dialog"
import { gameService, type GameRoom } from "@/lib/supabase-game-service"
import { createClient } from "@/lib/supabase/client"
import { useWalletAuth, updateUserProfile } from "@/lib/wallet-auth"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LobbyPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const {
    user,
    isLoading: authLoading,
    error: authError,
    needsManualFix,
    fixInstructions,
    refreshUser,
  } = useWalletAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [rooms, setRooms] = useState<GameRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "bet-high" | "bet-low">("newest")
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all")

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    if (user && publicKey) {
      const hasCompletedSetup = localStorage.getItem("username_setup_complete")
      const userKey = `username_setup_${publicKey.toString()}`
      const hasCompletedForThisWallet = localStorage.getItem(userKey)

      // Only show dialog if user hasn't completed setup for this wallet
      if (!hasCompletedSetup && !hasCompletedForThisWallet) {
        setIsFirstTimeUser(true)
        setShowUsernameDialog(true)
      }
    }
  }, [user, publicKey])

  const loadRooms = async () => {
    setIsLoading(true)
    const fetchedRooms = await gameService.getWaitingRooms()
    setRooms(fetchedRooms)
    setIsLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("lobby-rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
        },
        () => {
          loadRooms()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleJoinRoom = (roomId: string) => {
    if (!connected || !publicKey) {
      return
    }
    router.push(`/room/${roomId}`)
  }

  const copyToClipboard = () => {
    if (fixInstructions) {
      navigator.clipboard.writeText(fixInstructions)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUsernameSubmit = async (username: string) => {
    if (!publicKey) return

    console.log("[v0] Updating username to:", username)
    const success = await updateUserProfile(publicKey.toString(), { username })
    if (success) {
      const userKey = `username_setup_${publicKey.toString()}`
      localStorage.setItem(userKey, "true")
      localStorage.setItem("username_setup_complete", "true")

      console.log("[v0] Username updated, refreshing user data...")
      await refreshUser()

      await new Promise((resolve) => setTimeout(resolve, 500))

      setShowUsernameDialog(false)

      await new Promise((resolve) => setTimeout(resolve, 500))

      window.location.reload()
    } else {
      throw new Error("Failed to update username")
    }
  }

  const filteredAndSortedRooms = rooms
    .filter((room) => {
      if (filterType === "free") return room.bet_amount === 0
      if (filterType === "paid") return room.bet_amount > 0
      return true
    })
    .sort((a, b) => {
      if (sortBy === "bet-high") return b.bet_amount - a.bet_amount
      if (sortBy === "bet-low") return a.bet_amount - b.bet_amount
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (!connected) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4120_1px,transparent_1px),linear-gradient(to_bottom,#00ff4120_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-8 max-w-md text-center">
            <Wallet className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-4 game-title">Connect Your Wallet</h2>
            <p className="text-green-300/70 mb-6 game-text">
              Connect your Solana wallet to access the battle lobby and start fighting!
            </p>
            <WalletMultiButton className="!bg-gradient-to-r !from-green-600 !to-lime-600 hover:!from-green-700 hover:!to-lime-700 !text-black !font-bold !px-6 !py-3 !rounded-lg !w-full" />
          </Card>
        </div>
      </div>
    )
  }

  if (needsManualFix && fixInstructions) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff410120_1px,transparent_1px),linear-gradient(to_bottom,#ff410120_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
          <Card className="bg-black/80 backdrop-blur border-red-500/30 p-8 max-w-2xl">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-4 game-title text-center">DATABASE SETUP REQUIRED</h2>
            <p className="text-green-300 mb-6 game-text text-center">
              Your database needs a quick one-time setup. Follow these steps:
            </p>

            <div className="bg-black/60 border border-green-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-green-400 mb-3 game-text">Steps to Fix:</h3>
              <ol className="list-decimal list-inside space-y-2 text-green-300 game-text">
                <li>Go to your Supabase Dashboard</li>
                <li>Click on "SQL Editor" in the left sidebar</li>
                <li>Click "New Query"</li>
                <li>Copy and paste the SQL command below</li>
                <li>Click "Run" to execute</li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <div className="bg-black/60 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-bold game-text">SQL Command:</span>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-green-300 text-sm overflow-x-auto whitespace-pre-wrap break-all font-mono bg-black/40 p-3 rounded border border-green-500/20">
                {fixInstructions}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
              >
                I've Run the SQL - Refresh
              </Button>
              <Button
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                variant="outline"
                className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-green-400 text-xl game-text">Loading lobby...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4120_1px,transparent_1px),linear-gradient(to_bottom,#00ff4120_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black game-title">Battle Lobby</h1>
            <p className="text-green-400 mt-2 text-lg game-text">Choose your fight or create a new room</p>
            {user && (
              <p className="text-green-300/70 text-sm mt-1 game-text">
                Welcome, {user.username} | Wins: {user.wins} | Losses: {user.losses}
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Filters and view controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm game-text">Filter:</span>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32 bg-black/50 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/30">
                <SelectItem value="all" className="text-green-400">
                  All Rooms
                </SelectItem>
                <SelectItem value="free" className="text-green-400">
                  Free Only
                </SelectItem>
                <SelectItem value="paid" className="text-green-400">
                  Paid Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm game-text">Sort:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40 bg-black/50 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/30">
                <SelectItem value="newest" className="text-green-400">
                  Newest First
                </SelectItem>
                <SelectItem value="bet-high" className="text-green-400">
                  Highest Bet
                </SelectItem>
                <SelectItem value="bet-low" className="text-green-400">
                  Lowest Bet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-green-400 text-sm game-text">View:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`border-green-500/30 ${viewMode === "grid" ? "bg-green-500/20 text-green-400" : "text-green-400 hover:bg-green-500/10"}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`border-green-500/30 ${viewMode === "list" ? "bg-green-500/20 text-green-400" : "text-green-400 hover:bg-green-500/10"}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRooms.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Swords className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-green-400 mb-3 game-title">No Active Rooms</h3>
                <p className="text-green-300/70 mb-8 text-lg game-text">Be the first to create a battle room!</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>
              </div>
            ) : (
              filteredAndSortedRooms.map((room) => {
                const isMyRoom = user && room.host_id === user.id
                const isFreeRoom = room.bet_amount === 0

                return (
                  <Card
                    key={room.id}
                    className={`bg-black/80 backdrop-blur border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer group ${
                      isMyRoom ? "ring-2 ring-lime-500/50" : ""
                    }`}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-400 group-hover:text-lime-400 transition-colors game-text">
                            {room.room_name || `Room ${room.room_code}`}
                          </h3>
                          <p className="text-sm text-green-300/70 mt-1">Host: {room.host?.username || "Unknown"}</p>
                          {isMyRoom && (
                            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30 mt-2">Your Room</Badge>
                          )}
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Open</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-green-300">
                          {isFreeRoom ? (
                            <>
                              <Users className="w-5 h-5 text-blue-400" />
                              <span className="text-sm font-medium game-text">Practice</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-5 h-5 text-yellow-400" />
                              <span className="text-sm font-medium game-text">{room.bet_amount} PKT</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-green-300">
                          <Users className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium game-text">1/2</span>
                        </div>
                      </div>

                      {isFreeRoom ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 w-full justify-center game-text">
                          Free Practice
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-full justify-center game-text">
                          Ranked Match
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 text-green-300/70 text-xs game-text">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(room.created_at).toLocaleTimeString()}</span>
                      </div>

                      <div className="space-y-2">
                        {isMyRoom ? (
                          <>
                            <Button
                              className="w-full bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-black font-bold"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleJoinRoom(room.id)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Your Room
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinRoom(room.id)
                            }}
                          >
                            <Swords className="w-4 h-4 mr-2" />
                            Join Battle
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedRooms.length === 0 ? (
              <div className="text-center py-20">
                <Swords className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-green-400 mb-3 game-title">No Active Rooms</h3>
                <p className="text-green-300/70 mb-8 text-lg game-text">Be the first to create a battle room!</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>
              </div>
            ) : (
              filteredAndSortedRooms.map((room) => {
                const isMyRoom = user && room.host_id === user.id
                const isFreeRoom = room.bet_amount === 0

                return (
                  <Card
                    key={room.id}
                    className={`bg-black/80 backdrop-blur border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer ${
                      isMyRoom ? "ring-2 ring-lime-500/50" : ""
                    }`}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-bold text-green-400 game-text">
                            {room.room_name || `Room ${room.room_code}`}
                          </h3>
                          <p className="text-xs text-green-300/70">Host: {room.host?.username || "Unknown"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isFreeRoom ? (
                            <>
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-sm game-text text-green-300">Practice</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm game-text text-green-300">{room.bet_amount} PKT</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-xs game-text text-green-300/70">
                            {new Date(room.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinRoom(room.id)
                        }}
                      >
                        {isMyRoom ? <Eye className="w-4 h-4 mr-2" /> : <Swords className="w-4 h-4 mr-2" />}
                        {isMyRoom ? "View" : "Join"}
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>

      <CreateRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onRoomCreated={loadRooms} />
      <UsernameDialog
        open={showUsernameDialog}
        onOpenChange={setShowUsernameDialog}
        onSubmit={handleUsernameSubmit}
        currentUsername={user?.username}
        isFirstTime={isFirstTimeUser}
      />
    </div>
  )
}
