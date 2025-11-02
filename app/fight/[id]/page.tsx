"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useLobbyStore } from "@/lib/lobby-store"
import { fighters } from "@/lib/fighters"
import { solanaService } from "@/lib/solana-service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Swords, Trophy } from "lucide-react"

export default function FightPage() {
  const params = useParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { rooms, finishFight } = useLobbyStore()
  const [fightState, setFightState] = useState<"loading" | "fighting" | "finished">("loading")
  const [currentRound, setCurrentRound] = useState(1)
  const [player1Health, setPlayer1Health] = useState(100)
  const [player2Health, setPlayer2Health] = useState(100)
  const [fightLog, setFightLog] = useState<string[]>([])
  const [winner, setWinner] = useState<1 | 2 | null>(null)
  const [seed, setSeed] = useState<string>("")

  const roomId = params.id as string
  const room = rooms.find((r) => r.id === roomId)

  useEffect(() => {
    if (!connected || !room) {
      router.push("/lobby")
      return
    }

    if (room.status !== "fighting") {
      router.push(`/room/${roomId}`)
      return
    }

    // Start the fight simulation
    startFight()
  }, [connected, room, roomId, router])

  const startFight = async () => {
    if (!room || room.players.length !== 2) return

    // Generate provably fair seed
    const fightSeed = solanaService.generateSeed()
    setSeed(fightSeed)

    // Get fighter data
    const fighter1Data = fighters.find((f) => f.name === room.players[0].fighter)
    const fighter2Data = fighters.find((f) => f.name === room.players[1].fighter)

    if (!fighter1Data || !fighter2Data) return

    // Calculate fight outcome
    const outcome = solanaService.calculateFightOutcome(
      fightSeed,
      {
        name: fighter1Data.name,
        power: fighter1Data.power,
        speed: fighter1Data.speed,
        defense: fighter1Data.defense,
      },
      {
        name: fighter2Data.name,
        power: fighter2Data.power,
        speed: fighter2Data.speed,
        defense: fighter2Data.defense,
      },
    )

    // Simulate fight with animations
    setFightState("fighting")
    await simulateFight(fighter1Data, fighter2Data, outcome)
  }

  const simulateFight = async (fighter1: any, fighter2: any, outcome: { winner: 1 | 2; rounds: number }) => {
    const totalRounds = outcome.rounds

    for (let round = 1; round <= totalRounds; round++) {
      setCurrentRound(round)
      setFightLog((prev) => [...prev, `Round ${round} - FIGHT!`])

      // Simulate attacks
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const attacker = Math.random() > 0.5 ? 1 : 2
        const damage = Math.floor(Math.random() * 15) + 5

        if (attacker === 1) {
          setPlayer2Health((prev) => Math.max(0, prev - damage))
          setFightLog((prev) => [...prev, `${fighter1.name} attacks! -${damage} HP`])
        } else {
          setPlayer1Health((prev) => Math.max(0, prev - damage))
          setFightLog((prev) => [...prev, `${fighter2.name} attacks! -${damage} HP`])
        }
      }

      if (round < totalRounds) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setFightLog((prev) => [...prev, `Round ${round} complete!`])
      }
    }

    // Determine winner based on outcome
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (outcome.winner === 1) {
      setPlayer2Health(0)
      setFightLog((prev) => [...prev, `${fighter1.name} wins with a devastating final blow!`])
    } else {
      setPlayer1Health(0)
      setFightLog((prev) => [...prev, `${fighter2.name} wins with a devastating final blow!`])
    }

    setWinner(outcome.winner)
    setFightState("finished")

    // Update room with winner
    const winnerWallet = room!.players[outcome.winner - 1].wallet
    finishFight(roomId, winnerWallet, seed)

    // Navigate to results after delay
    setTimeout(() => {
      router.push(`/results/${roomId}`)
    }, 3000)
  }

  if (!room || fightState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-white">Preparing the arena...</p>
        </div>
      </div>
    )
  }

  const fighter1 = fighters.find((f) => f.name === room.players[0].fighter)
  const fighter2 = fighters.find((f) => f.name === room.players[1].fighter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Round Indicator */}
        <div className="text-center mb-8">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-2xl px-6 py-2">
            <Swords className="w-6 h-6 mr-2" />
            Round {currentRound}
          </Badge>
        </div>

        {/* Fighters Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Player 1 */}
          <Card className="bg-slate-900/50 backdrop-blur border-purple-500/20 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-purple-400">{fighter1?.name}</h3>
                  <p className="text-sm text-slate-400">Player 1</p>
                </div>
                {winner === 1 && <Trophy className="w-8 h-8 text-yellow-400" />}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Health</span>
                  <span className="text-white font-bold">{player1Health}/100</span>
                </div>
                <Progress value={player1Health} className="h-4 bg-slate-800" />
              </div>
              <div className="text-6xl text-center py-4">{fighter1?.avatar}</div>
            </div>
          </Card>

          {/* Player 2 */}
          <Card className="bg-slate-900/50 backdrop-blur border-purple-500/20 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-pink-400">{fighter2?.name}</h3>
                  <p className="text-sm text-slate-400">Player 2</p>
                </div>
                {winner === 2 && <Trophy className="w-8 h-8 text-yellow-400" />}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Health</span>
                  <span className="text-white font-bold">{player2Health}/100</span>
                </div>
                <Progress value={player2Health} className="h-4 bg-slate-800" />
              </div>
              <div className="text-6xl text-center py-4">{fighter2?.avatar}</div>
            </div>
          </Card>
        </div>

        {/* Fight Log */}
        <Card className="bg-slate-900/50 backdrop-blur border-purple-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Fight Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {fightLog.map((log, index) => (
              <div key={index} className="text-sm text-slate-300 font-mono animate-in fade-in slide-in-from-bottom-2">
                {log}
              </div>
            ))}
          </div>
        </Card>

        {/* Winner Announcement */}
        {fightState === "finished" && winner && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center space-y-6 animate-in zoom-in-50">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-5xl font-black text-white">{winner === 1 ? fighter1?.name : fighter2?.name} WINS!</h2>
              <p className="text-xl text-slate-300">Redirecting to results...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
