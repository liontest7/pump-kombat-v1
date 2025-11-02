import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface GameRoom {
  id: string
  room_code: string
  host_id: string
  opponent_id: string | null
  host_fighter: string | null
  opponent_fighter: string | null
  bet_amount: number
  status: "waiting" | "in_progress" | "completed" | "cancelled"
  winner_id: string | null
  host_health: number | null
  opponent_health: number | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  room_name?: string | null
  map?: string | null
  host?: User
  opponent?: User
}

export interface User {
  id: string
  username: string
  wallet_address: string
  token_balance: number
  wins: number
  losses: number
  total_games: number
  ranking_points: number
}

export const gameService = {
  // Create a new game room
  async createRoom(
    walletAddress: string,
    betAmount = 0,
    hostFighter?: string,
    roomName?: string,
    map?: string,
  ): Promise<GameRoom | null> {
    try {
      console.log("[v0] Creating room for wallet:", walletAddress)

      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, betAmount, hostFighter, roomName, map }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Error creating room:", error)
        return null
      }

      const { room } = await response.json()
      console.log("[v0] Room created successfully:", room.id)
      return room
    } catch (error) {
      console.error("[v0] Exception creating room:", error)
      return null
    }
  },

  // Join an existing room
  async joinRoom(walletAddress: string, roomId: string, fighter: string): Promise<boolean> {
    try {
      console.log("[v0] Joining room:", roomId, "for wallet:", walletAddress)

      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, roomId, fighter }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Error joining room:", error)
        return false
      }

      console.log("[v0] Room joined successfully")
      return true
    } catch (error) {
      console.error("[v0] Exception joining room:", error)
      return false
    }
  },

  // Get all waiting rooms
  async getWaitingRooms(): Promise<GameRoom[]> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rooms:", error)
      return []
    }

    return data || []
  },

  // Get room by ID
  async getRoom(roomId: string): Promise<GameRoom | null> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
      .from("game_rooms")
      .select(`
        *,
        host:users!game_rooms_host_id_fkey(id, username, wallet_address),
        opponent:users!game_rooms_opponent_id_fkey(id, username, wallet_address)
      `)
      .eq("id", roomId)
      .single()

    if (error) {
      console.error("Error fetching room:", error)
      return null
    }

    return data
  },

  // Update game state (health, etc.)
  async updateGameState(roomId: string, hostHealth: number, opponentHealth: number): Promise<boolean> {
    const supabase = createBrowserClient()

    const { error } = await supabase
      .from("game_rooms")
      .update({
        host_health: hostHealth,
        opponent_health: opponentHealth,
      })
      .eq("id", roomId)

    if (error) {
      console.error("Error updating game state:", error)
      return false
    }

    return true
  },

  // Finish game and record result
  async finishGame(roomId: string, winnerId: string): Promise<boolean> {
    try {
      console.log("[v0] Finishing game:", roomId, "winner:", winnerId)

      const response = await fetch("/api/game/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, winnerId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Error finishing game:", error)
        return false
      }

      console.log("[v0] Game finished successfully")
      return true
    } catch (error) {
      console.error("[v0] Exception finishing game:", error)
      return false
    }
  },

  // Subscribe to room updates
  subscribeToRoom(roomId: string, callback: (room: GameRoom) => void) {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload.new as GameRoom)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return null

    const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  },

  // Update user token balance
  async updateTokenBalance(userId: string, amount: number): Promise<boolean> {
    const supabase = createBrowserClient()

    const { error } = await supabase
      .from("users")
      .update({
        token_balance: amount,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating balance:", error)
      return false
    }

    return true
  },

  // Get leaderboard
  async getLeaderboard(): Promise<User[]> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("leaderboard").select("*").limit(100)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }

    return data || []
  },

  // Get user profile by wallet
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("users").select("*").eq("wallet_address", walletAddress).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  },

  // Update fighter selection
  async updateFighterSelection(
    roomId: string,
    walletAddress: string,
    fighter: string,
    isHost: boolean,
  ): Promise<boolean> {
    const supabase = createBrowserClient()

    const updateField = isHost ? "host_fighter" : "opponent_fighter"

    const { error } = await supabase
      .from("game_rooms")
      .update({ [updateField]: fighter })
      .eq("id", roomId)

    if (error) {
      console.error("Error updating fighter:", error)
      return false
    }

    return true
  },
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
