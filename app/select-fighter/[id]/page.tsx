"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { fighters } from "@/lib/fighters"
import { useLobbyStore } from "@/lib/lobby-store"
import { Lock } from "lucide-react"

export default function SelectFighterPage() {
  const params = useParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { rooms, selectFighter } = useLobbyStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [hasSelected, setHasSelected] = useState(false)

  const roomId = params.id as string
  const room = rooms.find((r) => r.id === roomId)
  const currentPlayer = room?.players.find((p) => p.wallet === publicKey?.toString())
  const opponent = room?.players.find((p) => p.wallet !== publicKey?.toString())

  useEffect(() => {
    if (hasSelected || !room) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasSelected, room])

  useEffect(() => {
    if (timeLeft === 0 && !hasSelected && publicKey && room) {
      const fighter = fighters[selectedIndex]
      console.log("[v0] Auto-selecting fighter due to timeout:", fighter.name)
      selectFighter(roomId, publicKey.toString(), fighter.name)
      setHasSelected(true)
    }
  }, [timeLeft, hasSelected, publicKey, room, selectedIndex, roomId, selectFighter])

  useEffect(() => {
    if (room && room.players.length === 2 && room.players.every((p) => p.fighter)) {
      console.log("[v0] Both players selected fighters, starting fight")
      setTimeout(() => {
        const mapToUse = room.map || "nordkiez2"
        router.push(
          `/fight?roomId=${roomId}&player1=${room.players[0].fighter}&player2=${room.players[1].fighter}&map=${mapToUse}`,
        )
      }, 2000)
    }
  }, [room, roomId, router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasSelected) return

      switch (e.key) {
        case "ArrowRight":
          setSelectedIndex((prev) => (prev + 1) % fighters.length)
          break
        case "ArrowLeft":
          setSelectedIndex((prev) => (prev - 1 + fighters.length) % fighters.length)
          break
        case "ArrowUp":
          setSelectedIndex((prev) => {
            if (prev < 3) return prev + 3
            return prev - 3
          })
          break
        case "ArrowDown":
          setSelectedIndex((prev) => {
            if (prev >= 3) return prev - 3
            return prev + 3
          })
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, hasSelected])

  const handleLockSelection = () => {
    if (hasSelected || !publicKey) return

    const fighter = fighters[selectedIndex]
    console.log("[v0] Player locked fighter:", fighter.name)
    selectFighter(roomId, publicKey.toString(), fighter.name)
    setHasSelected(true)
  }

  if (!connected || !room) {
    router.push("/lobby")
    return null
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#001428] pixelated">
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-4xl">
        {/* Timer */}
        <div className="mb-4 text-center">
          <div className="text-6xl font-black text-red-400 game-title animate-pulse">{timeLeft}s</div>
          <p className="text-white game-text mt-2">Choose your fighter!</p>
        </div>

        <h2 className="game-title text-4xl mb-8 brightness-125">Select Your Fighter</h2>

        <div className="grid grid-cols-3 grid-rows-2 gap-8 mb-8">
          {fighters.map((fighter, index) => (
            <div
              key={fighter.id}
              className={`relative w-32 h-32 cursor-pointer ${
                selectedIndex === index && !hasSelected
                  ? "ring-4 ring-orange-500 scale-110 transform transition-all"
                  : ""
              } ${hasSelected && currentPlayer?.fighter === fighter.name ? "ring-4 ring-green-500 scale-110" : ""}`}
              onClick={() => {
                if (!hasSelected) {
                  setSelectedIndex(index)
                }
              }}
            >
              <Image
                src={fighter.portrait || "/placeholder.svg"}
                alt={fighter.name}
                width={128}
                height={128}
                className="pixelated w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-xs py-1 game-text">
                {fighter.name}
              </div>
              {currentPlayer?.fighter === fighter.name && (
                <div className="absolute top-0 left-0 right-0 bg-green-500/90 text-center text-xs py-1 game-text flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  YOU
                </div>
              )}
              {opponent?.fighter === fighter.name && (
                <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-center text-xs py-1 game-text">
                  OPPONENT
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 game-text text-center">
          <div className="text-2xl text-white">{fighters[selectedIndex].name}</div>
          <div className="text-sm mt-2 text-gray-400">{fighters[selectedIndex].description}</div>
          <div className="text-sm mt-1 text-orange-500">Special: {fighters[selectedIndex].specialMove}</div>
          <div className="text-xs mt-2 text-slate-400">
            Power: {fighters[selectedIndex].power} | Speed: {fighters[selectedIndex].speed} | Defense:{" "}
            {fighters[selectedIndex].defense}
          </div>
        </div>

        {!hasSelected && (
          <Button
            onClick={handleLockSelection}
            size="lg"
            className="mt-6 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold text-xl px-12 py-6"
          >
            <Lock className="w-5 h-5 mr-2" />
            Lock Fighter
          </Button>
        )}

        {/* Waiting message */}
        {hasSelected && !room.players.every((p) => p.fighter) && (
          <div className="mt-8 text-center">
            <p className="text-xl text-yellow-400 game-text blink">Waiting for opponent...</p>
          </div>
        )}

        {/* Both selected message */}
        {room.players.every((p) => p.fighter) && (
          <div className="mt-8 text-center">
            <p className="text-2xl text-green-400 game-text blink">FIGHT STARTING!</p>
          </div>
        )}
      </div>
    </div>
  )
}
