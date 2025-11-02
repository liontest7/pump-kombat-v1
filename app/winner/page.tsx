"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { Trophy, X } from "lucide-react"

export default function WinnerScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const winner = searchParams.get("winner")
  const playerId = searchParams.get("player") || fighters[0].id
  const cpuId = searchParams.get("cpu") || fighters[1].id
  const roundCount = Number.parseInt(searchParams.get("round") || "1", 10)
  const difficulty = Number.parseFloat(searchParams.get("difficulty") || "1.0")

  const previousOpponentsParam = searchParams.get("prevOpponents") || ""
  const previousOpponents = previousOpponentsParam ? previousOpponentsParam.split(",") : []

  const playerFighter = fighters.find((f) => f.id === playerId) || fighters[0]
  const cpuFighter = fighters.find((f) => f.id === cpuId) || fighters[1]

  const [showContinue, setShowContinue] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [isCountingDown, setIsCountingDown] = useState(winner === "player")

  const startNextRound = useCallback(() => {
    if (winner === "player") {
      const opponentsToAvoid = [playerId, cpuId, ...previousOpponents]
      const availableFighters = fighters.filter((f) => !opponentsToAvoid.includes(f.id))

      const fightersToChooseFrom =
        availableFighters.length > 0 ? availableFighters : fighters.filter((f) => f.id !== cpuId && f.id !== playerId)

      const randomIndex = Math.floor(Math.random() * fightersToChooseFrom.length)
      const newOpponent = fightersToChooseFrom[randomIndex]

      const updatedPreviousOpponents = [...previousOpponents, cpuId].slice(-4)
      const newDifficulty = difficulty + 0.2

      router.push(
        `/fight?player=${playerId}&cpu=${newOpponent.id}&round=${roundCount + 1}&difficulty=${newDifficulty.toFixed(1)}&prevOpponents=${updatedPreviousOpponents.join(",")}`,
      )
    } else {
      router.push("/")
    }
  }, [router, winner, playerId, cpuId, roundCount, difficulty, previousOpponents])

  useEffect(() => {
    if (!isCountingDown) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          startNextRound()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCountingDown, startNextRound])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowContinue((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        startNextRound()
      } else if (e.key === "Escape") {
        router.push("/")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, startNextRound])

  const winnerText = winner === "player" ? "You Won!" : "You Lost!"
  const winnerFighter = winner === "player" ? playerFighter : cpuFighter
  const loserFighter = winner === "player" ? cpuFighter : playerFighter

  const spriteToShow =
    winner === "player"
      ? winnerFighter.wonSprite || "/images/victory.png"
      : loserFighter.lostSprite || "/images/defeat.png"

  const backgroundImage = winner === "player" ? "/images/youwon.jpg" : "/images/youlost.jpg"
  const titleColor = winner === "player" ? "#10b981" : "#ef4444"

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:14px_24px]" />
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt={winner === "player" ? "Victory Background" : "Defeat Background"}
          fill
          className="object-cover pixelated opacity-30"
          priority
        />
      </div>

      <div className="z-10 flex flex-col items-center justify-center h-full py-12 pt-24 space-y-8">
        <div className="text-center space-y-6">
          <h1 className="game-title text-7xl text-white drop-shadow-lg">
            {winner === "player" ? "VICTORY!" : "DEFEAT!"}
          </h1>
          <p className="text-4xl font-bold text-white">{winnerText}</p>

          <div className="flex justify-center pt-4">
            {winner === "player" ? (
              <Trophy className="w-32 h-32 text-yellow-400 animate-bounce drop-shadow-2xl" />
            ) : (
              <X className="w-32 h-32 text-red-400 drop-shadow-2xl" />
            )}
          </div>
        </div>

        <div className="flex-grow flex items-end justify-center">
          <div className="relative w-80 h-80 flex items-end justify-center">
            <Image
              src={spriteToShow || "/placeholder.svg"}
              alt={winner === "player" ? "Victorious Fighter" : "Defeated Fighter"}
              width={200}
              height={200}
              className="pixelated object-contain object-bottom drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className={`game-text text-2xl text-white ${showContinue ? "opacity-100" : "opacity-0"}`}>
            {winner === "player" ? "PRESS ENTER FOR NEXT ROUND" : "PRESS ENTER TO PLAY AGAIN"}
          </div>

          {winner === "player" && <div className="game-text text-lg text-green-400">PRESS ESC TO RETURN TO MENU</div>}
        </div>
      </div>
    </div>
  )
}
