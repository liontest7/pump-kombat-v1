"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { gameService, type GameRoom } from "@/lib/supabase-game-service"
import { useLobbyStore } from "@/lib/lobby-store"
import { ArrowLeft, Users, Check, Loader2, Bot } from "lucide-react"
import { BetConfirmationDialog } from "@/components/bet-confirmation-dialog"
import type { Room } from "@/types/room" // Declare the Room variable here

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { rooms, joinRoom, joinBot, createRoom: createLocalRoom } = useLobbyStore()
  const [showBetDialog, setShowBetDialog] = useState(false)
  const [hasPaidBet, setHasPaidBet] = useState(false)
  const [supabaseRoom, setSupabaseRoom] = useState<GameRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInvitingBot, setIsInvitingBot] = useState(false)

  const roomId = params.id as string
  const room = rooms.find((r) => r.id === roomId)

  useEffect(() => {
    const fetchRoom = async () => {
      console.log("[v0] Fetching room from Supabase:", roomId)
      const dbRoom = await gameService.getRoom(roomId)

      if (!dbRoom) {
        console.error("[v0] Room not found in database")
        router.push("/lobby")
        return
      }

      console.log("[v0] Room fetched from Supabase:", dbRoom)
      setSupabaseRoom(dbRoom)

      if (!room && publicKey) {
        console.log("[v0] Creating local room from Supabase data with matching ID")
        // Create local room with the same ID as Supabase room
        const newRoom: Room = {
          id: roomId, // Use Supabase room ID instead of generating new one
          name: `Room ${dbRoom.room_code}`,
          betAmount: Number(dbRoom.bet_amount),
          creator: publicKey.toString(),
          roomType: dbRoom.bet_amount === 0 ? "free" : "ranked",
          status: "waiting",
          players: [{ wallet: publicKey.toString(), ready: false }],
          createdAt: Date.now(),
          map: dbRoom.map || undefined,
        }

        // Manually add to store instead of using createRoom
        useLobbyStore.setState((state) => ({
          rooms: [...state.rooms, newRoom],
        }))

        console.log("[v0] Local room created with ID:", roomId)
      }

      setIsLoading(false)
    }

    fetchRoom()

    const unsubscribe = gameService.subscribeToRoom(roomId, (updatedRoom) => {
      console.log("[v0] Room updated from Supabase:", updatedRoom)
      setSupabaseRoom(updatedRoom)
    })

    return () => {
      unsubscribe()
    }
  }, [roomId, router, room, publicKey])

  const currentPlayer = room?.players.find((p) => p.wallet === publicKey?.toString())
  const isCreator =
    supabaseRoom?.host?.wallet_address === publicKey?.toString() || room?.creator === publicKey?.toString()
  const isFreeRoom = supabaseRoom?.bet_amount === 0 || room?.roomType === "free"
  const hasOpponent = supabaseRoom?.opponent_id !== null || (room?.players && room.players.length >= 2)

  useEffect(() => {
    console.log("[v0] Bot button visibility check:", {
      isFreeRoom,
      isCreator,
      hasOpponent,
      hostWallet: supabaseRoom?.host?.wallet_address,
      currentWallet: publicKey?.toString(),
      shouldShowBotButton: isFreeRoom && isCreator && !hasOpponent,
    })
  }, [isFreeRoom, isCreator, hasOpponent, supabaseRoom?.host?.wallet_address, publicKey])

  useEffect(() => {
    if (!connected) {
      router.push("/")
      return
    }

    if (isLoading) return

    if (publicKey && !currentPlayer && room && room.players.length < 2) {
      console.log("[v0] Auto-joining room as creator")
      joinRoom(roomId, publicKey.toString())

      if (!isFreeRoom) {
        setShowBetDialog(true)
      } else {
        console.log("[v0] Free room, setting hasPaidBet to true")
        setHasPaidBet(true)
      }
    }
  }, [connected, room, publicKey, currentPlayer, roomId, joinRoom, router, isFreeRoom, isLoading])

  useEffect(() => {
    if (!supabaseRoom) return

    const hasSupabasePlayers = supabaseRoom.host_id && supabaseRoom.opponent_id
    const bothPlayersReady = hasSupabasePlayers
    const shouldRedirect = bothPlayersReady && (isFreeRoom || hasPaidBet)

    console.log("[v0] Checking redirect:", {
      hasSupabasePlayers,
      bothPlayersReady,
      isFreeRoom,
      hasPaidBet,
      shouldRedirect,
      supabaseRoom: {
        host_id: supabaseRoom.host_id,
        opponent_id: supabaseRoom.opponent_id,
        status: supabaseRoom.status,
      },
    })

    if (shouldRedirect) {
      console.log("[v0] Both players in room, redirecting to fighter selection")
      router.push(`/select-fighter/${roomId}`)
    }
  }, [supabaseRoom, supabaseRoom?.host_id, supabaseRoom?.opponent_id, roomId, router, hasPaidBet, isFreeRoom])

  const opponent = room?.players.find((p) => p.wallet !== publicKey?.toString())
  const isBot = opponent?.wallet.startsWith("BOT_")

  const handleInviteBot = async () => {
    setIsInvitingBot(true)
    try {
      console.log("[v0] Inviting bot to room:", roomId)
      const response = await fetch("/api/rooms/join-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Failed to invite bot:", error)
        alert(error.error || "Failed to invite bot")
        setIsInvitingBot(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Bot joined successfully:", data)

      if (room) {
        joinBot(roomId) // Now uses matching Supabase room ID
      }

      // Refresh room data to trigger redirect
      const updatedRoom = await gameService.getRoom(roomId)
      if (updatedRoom) {
        setSupabaseRoom(updatedRoom)
      }
    } catch (error) {
      console.error("[v0] Error inviting bot:", error)
      alert("Failed to invite bot. Please try again.")
    } finally {
      setIsInvitingBot(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4120_1px,transparent_1px),linear-gradient(to_bottom,#00ff4120_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/lobby")}
              className="text-green-400 hover:text-lime-400 hover:bg-green-500/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-green-400 game-title">
                {room?.name || `Room ${supabaseRoom?.room_code}`}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge
                  className={
                    isFreeRoom
                      ? "bg-green-500/20 text-green-400 border-green-500/30 game-text"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 game-text"
                  }
                >
                  {isFreeRoom ? "Free Practice" : `${supabaseRoom?.bet_amount || room?.betAmount} PKT`}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 game-text">
                  <Users className="w-3 h-3 mr-1" />
                  {room?.players.length || 1}/2
                </Badge>
                {room?.map && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 game-text">{room.map}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Player 1 (Creator) */}
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-400 game-text">Player 1 (Host)</h3>
                  <p className="text-sm text-green-300/70">
                    {supabaseRoom?.host?.wallet_address ? (
                      <>
                        {supabaseRoom.host.wallet_address.slice(0, 8)}...{supabaseRoom.host.wallet_address.slice(-6)}
                      </>
                    ) : room?.creator ? (
                      <>
                        {room.creator.slice(0, 8)}...{room.creator.slice(-6)}
                      </>
                    ) : (
                      "Waiting..."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Player 2 (Opponent) */}
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6">
            <div className="space-y-4">
              {opponent || hasOpponent ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-green-400 game-text flex items-center gap-2">
                        {isBot ? (
                          <>
                            <Bot className="w-5 h-5 text-cyan-400" />
                            AI Opponent
                          </>
                        ) : (
                          "Player 2"
                        )}
                      </h3>
                      <p className="text-sm text-green-300/70">
                        {isBot
                          ? "Computer Controlled"
                          : opponent
                            ? `${opponent.wallet.slice(0, 8)}...${opponent.wallet.slice(-6)}`
                            : supabaseRoom?.opponent?.wallet_address
                              ? `${supabaseRoom.opponent.wallet_address.slice(0, 8)}...${supabaseRoom.opponent.wallet_address.slice(-6)}`
                              : "Joined"}
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 game-text">
                      <Check className="w-3 h-3 mr-1" />
                      Joined
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-400 game-text">Waiting for opponent...</p>
                  {isFreeRoom && isCreator && (
                    <Button
                      onClick={handleInviteBot}
                      disabled={isInvitingBot}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold disabled:opacity-50"
                    >
                      {isInvitingBot ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Inviting Bot...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Play vs Bot
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Starting Message */}
        {supabaseRoom?.host_id && supabaseRoom?.opponent_id && (isFreeRoom || hasPaidBet) && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
            <p className="text-2xl font-bold text-green-400 game-title">Preparing Fighter Selection...</p>
          </div>
        )}
      </div>

      {/* Bet Confirmation Dialog */}
      {!isFreeRoom && (
        <BetConfirmationDialog
          open={showBetDialog}
          onOpenChange={setShowBetDialog}
          betAmount={supabaseRoom?.bet_amount || room?.betAmount}
          roomName={room?.name || `Room ${supabaseRoom?.room_code}`}
          onConfirm={(signature) => {
            console.log("[v0] Bet confirmed:", signature)
            setHasPaidBet(true)
          }}
        />
      )}
    </div>
  )
}
