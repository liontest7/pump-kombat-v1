import { create } from "zustand"

export interface Player {
  wallet: string
  fighter?: string
  ready: boolean
}

export interface Room {
  id: string
  name: string
  creator: string
  betAmount: number
  roomType: "free" | "ranked"
  status: "waiting" | "ready" | "fighting" | "finished"
  players: Player[]
  createdAt: number
  winner?: string
  transactionId?: string
  seed?: string
  map?: string
}

interface LobbyStore {
  rooms: Room[]
  createRoom: (data: {
    name: string
    betAmount: number
    creator: string
    roomType: "free" | "ranked"
    map?: string
  }) => string
  joinRoom: (roomId: string, wallet: string) => void
  joinBot: (roomId: string) => void
  selectFighter: (roomId: string, wallet: string, fighter: string) => void
  setReady: (roomId: string, wallet: string) => void
  startFight: (roomId: string) => void
  finishFight: (roomId: string, winner: string, seed: string) => void
  setMap: (roomId: string, map: string) => void
  cleanupFinishedRooms: () => void
}

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  rooms: [],

  createRoom: (data) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const stageFiles = ["intimes", "nordkiez2", "raw1", "raw2", "boxi_final", "rigaer1"]
    const selectedMap = data.map
      ? mapDisplayNameToFile(data.map)
      : stageFiles[Math.floor(Math.random() * stageFiles.length)]

    const newRoom: Room = {
      id: roomId,
      name: data.name,
      creator: data.creator,
      betAmount: data.betAmount,
      roomType: data.roomType,
      status: "waiting",
      players: [{ wallet: data.creator, ready: false }],
      createdAt: Date.now(),
      map: selectedMap,
    }
    set((state) => ({ rooms: [...state.rooms, newRoom] }))
    return roomId
  },

  joinRoom: (roomId, wallet) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId && room.players.length < 2
          ? {
              ...room,
              players: [...room.players, { wallet, ready: false }],
              status: room.players.length === 1 ? "ready" : room.status,
            }
          : room,
      ),
    }))
  },

  joinBot: (roomId) => {
    const botWallet = `BOT_${Math.random().toString(36).substr(2, 9)}`

    console.log("[v0] Bot joining room:", roomId)

    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId && room.players.length < 2
          ? {
              ...room,
              players: [...room.players, { wallet: botWallet, ready: false }],
              status: "ready",
            }
          : room,
      ),
    }))
  },

  selectFighter: (roomId, wallet, fighter) => {
    console.log("[v0] Player selecting fighter:", { roomId, wallet, fighter })

    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== roomId) return room

        const updatedPlayers = room.players.map((p) => (p.wallet === wallet ? { ...p, fighter } : p))

        const botPlayer = updatedPlayers.find((p) => p.wallet.startsWith("BOT_"))
        if (botPlayer && !botPlayer.fighter) {
          const botFighters = ["Ryu", "Ken", "Chun-Li", "Guile", "Blanka", "Zangief"]
          const randomFighter = botFighters[Math.floor(Math.random() * botFighters.length)]
          botPlayer.fighter = randomFighter
          console.log("[v0] Bot auto-selected fighter:", randomFighter)
        }

        return {
          ...room,
          players: updatedPlayers,
        }
      }),
    }))
  },

  setReady: (roomId, wallet) => {
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== roomId) return room

        const updatedPlayers = room.players.map((p) => (p.wallet === wallet ? { ...p, ready: true } : p))

        const bothReady = updatedPlayers.length === 2 && updatedPlayers.every((p) => p.ready && p.fighter)

        return {
          ...room,
          players: updatedPlayers,
          status: bothReady ? "fighting" : room.status,
        }
      }),
    }))
  },

  startFight: (roomId) => {
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, status: "fighting" } : room)),
    }))
  },

  finishFight: (roomId, winner, seed) => {
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== roomId) return room

        const winnerWallet = winner === "player1" ? room.players[0]?.wallet : room.players[1]?.wallet

        return {
          ...room,
          status: "finished",
          winner: winnerWallet,
          seed,
        }
      }),
    }))

    setTimeout(() => {
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== roomId),
      }))
    }, 30000)
  },

  setMap: (roomId, map) => {
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, map } : room)),
    }))
  },

  cleanupFinishedRooms: () => {
    set((state) => ({
      rooms: state.rooms.filter((r) => r.status !== "finished"),
    }))
  },
}))

function mapDisplayNameToFile(displayName: string): string {
  const mapping: Record<string, string> = {
    "Tokyo Street": "intimes",
    "Berlin Rooftop": "nordkiez2",
    "New York Subway": "raw1",
    "London Bridge": "raw2",
    "Paris Arena": "boxi_final",
  }
  return mapping[displayName] || "rigaer1"
}
