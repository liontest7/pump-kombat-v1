"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coins, Users, Map, Shuffle } from "lucide-react"
import { gameService } from "@/lib/supabase-game-service"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated?: () => void
}

const AVAILABLE_MAPS = [
  { id: "random", name: "Random Map", icon: Shuffle },
  { id: "boxi_final", name: "Boxi Arena" },
  { id: "intimes", name: "Intimes District" },
  { id: "nordkiez2", name: "Nordkiez Streets" },
  { id: "raw1", name: "RAW Temple" },
  { id: "raw2", name: "RAW Courtyard" },
  { id: "rigaer1", name: "Rigaer Straße" },
]

export function CreateRoomDialog({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) {
  const router = useRouter()
  const { publicKey } = useWallet()
  const [roomType, setRoomType] = useState<"free" | "ranked">("free")
  const [betAmount, setBetAmount] = useState("100")
  const [isCreating, setIsCreating] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [selectedMap, setSelectedMap] = useState("random")

  const handleCreate = async () => {
    if (!publicKey) return
    if (roomType === "ranked" && !betAmount) return

    setIsCreating(true)

    try {
      console.log("[v0] Creating room for wallet:", publicKey.toString())

      const room = await gameService.createRoom(
        publicKey.toString(),
        roomType === "free" ? 0 : Number.parseFloat(betAmount),
        undefined, // hostFighter will be set to username by API
        roomName.trim() || undefined,
        selectedMap === "random" ? undefined : selectedMap,
      )

      if (!room) {
        console.error("[v0] Failed to create room in database")
        alert("Failed to create room. Please try again.")
        setIsCreating(false)
        return
      }

      console.log("[v0] Room created successfully:", room.id)

      onOpenChange(false)
      setBetAmount("100")
      setRoomType("free")
      setRoomName("")
      setSelectedMap("random")
      onRoomCreated?.()

      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error("[v0] Error creating room:", error)
      alert("Failed to create room. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur border-green-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 game-title">Create Battle Room</DialogTitle>
          <DialogDescription className="text-green-300/70">
            Set up your room and wait for an opponent to join
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-green-400">
              Room Name (Optional)
            </Label>
            <Input
              id="roomName"
              type="text"
              placeholder="My Epic Battle"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={50}
              className="bg-black/50 border-green-500/30 text-green-400"
            />
            <p className="text-xs text-green-300/70">Leave empty for auto-generated name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="map" className="text-green-400">
              Battle Arena
            </Label>
            <Select value={selectedMap} onValueChange={setSelectedMap}>
              <SelectTrigger className="bg-black/50 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/30">
                {AVAILABLE_MAPS.map((map) => (
                  <SelectItem key={map.id} value={map.id} className="text-green-400">
                    <div className="flex items-center gap-2">
                      {map.icon ? <map.icon className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                      {map.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-green-300/70">Choose your preferred battle location</p>
          </div>

          {/* Room Type */}
          <div className="space-y-3">
            <Label className="text-green-400">Room Type</Label>
            <RadioGroup value={roomType} onValueChange={(value) => setRoomType(value as "free" | "ranked")}>
              <div className="flex items-center space-x-2 bg-black/50 p-4 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-green-400 font-semibold">Practice Mode (Free)</span>
                  </div>
                  <p className="text-xs text-green-300/70 mt-1">No tokens required - perfect for practice</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-black/50 p-4 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors">
                <RadioGroupItem value="ranked" id="ranked" />
                <Label htmlFor="ranked" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-green-400 font-semibold">Ranked Match (Tokens)</span>
                  </div>
                  <p className="text-xs text-green-300/70 mt-1">Bet tokens and win big rewards</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Bet Amount - Only show for ranked rooms */}
          {roomType === "ranked" && (
            <div className="space-y-2">
              <Label htmlFor="betAmount" className="text-green-400">
                Bet Amount (PKT)
              </Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                <Input
                  id="betAmount"
                  type="number"
                  step="10"
                  min="10"
                  placeholder="100"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-black/50 border-green-500/30 text-green-400 pl-10"
                />
              </div>
              <p className="text-xs text-green-300/70">Minimum bet: 10 PKT • Platform fee: 5%</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              {roomType === "free" ? "Practice Mode:" : "How it works:"}
            </h4>
            <ul className="text-xs text-green-300/70 space-y-1">
              {roomType === "free" ? (
                <>
                  <li>• No tokens required to play</li>
                  <li>• Invite a bot if no players join</li>
                  <li>• Select fighters after both players join</li>
                  <li>• Perfect for testing strategies</li>
                </>
              ) : (
                <>
                  <li>• Both players deposit the bet amount</li>
                  <li>• Select fighters after both players join</li>
                  <li>• Winner takes 95% of the pot (5% platform fee)</li>
                  <li>• Fight outcome is provably fair and verifiable</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
