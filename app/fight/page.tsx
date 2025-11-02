"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { FightControls } from "@/components/fight-controls"
import { PowerBar } from "@/components/power-bar"
import { Fighter } from "@/components/fighter"
import { getRandomFighter } from "@/lib/game-utils"
import { gameService } from "@/lib/supabase-game-service"

export default function FightScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const roomId = searchParams.get("roomId")
  const isMultiplayer = !!roomId
  const mapName = searchParams.get("map")

  const player1FighterName = searchParams.get("player1") || searchParams.get("player")
  const player2FighterName = searchParams.get("player2") || searchParams.get("cpu")

  const playerId = searchParams.get("player") || fighters[0].id
  const playerFighter = isMultiplayer
    ? fighters.find((f) => f.name === player1FighterName) || fighters[0]
    : fighters.find((f) => f.id === playerId) || fighters[0]

  const previousOpponentsParam = searchParams.get("prevOpponents") || ""
  const previousOpponents = previousOpponentsParam ? previousOpponentsParam.split(",") : []

  const cpuFighterRef = useRef(
    isMultiplayer && player2FighterName
      ? fighters.find((f) => f.name === player2FighterName) || getRandomFighter(playerId, previousOpponents)
      : getRandomFighter(playerId, previousOpponents),
  )
  const cpuFighter = cpuFighterRef.current

  const stageBackgroundRef = useRef(
    mapName ? `/images/stages/stage-${mapName}.jpg` : "/images/stages/stage-nordkiez2.jpg",
  )
  const stageBackground = stageBackgroundRef.current

  const roundCount = Number.parseInt(searchParams.get("round") || "1", 10)
  const difficulty = Number.parseFloat(searchParams.get("difficulty") || "1.0")

  const [playerHealth, setPlayerHealth] = useState(100)
  const [cpuHealth, setCpuHealth] = useState(100)
  const [playerPosition, setPlayerPosition] = useState(150)
  const [cpuPosition, setCpuPosition] = useState(150)
  const [playerState, setPlayerState] = useState("idle")
  const [cpuState, setCpuState] = useState("idle")
  const [isPlayerFacingLeft, setIsPlayerFacingLeft] = useState(false)
  const [isCpuFacingLeft, setIsCpuFacingLeft] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player" | "cpu" | null>(null)
  const [isPlayerHit, setIsPlayerHit] = useState(false)
  const [isCpuHit, setIsCpuHit] = useState(false)
  const [isPlayerWalking, setIsPlayerWalking] = useState(false)
  const [isCpuWalking, setIsCpuWalking] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [hostId, setHostId] = useState<string | null>(null)

  useEffect(() => {
    const loadRoomData = async () => {
      if (!isMultiplayer || !roomId) return

      const room = await gameService.getRoom(roomId)
      if (room) {
        setHostId(room.host_id)
      }

      const user = await gameService.getCurrentUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }

    loadRoomData()
  }, [isMultiplayer, roomId])

  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    s: false,
    d: false,
  })

  const playerHealthRef = useRef(100)
  const cpuHealthRef = useRef(100)
  const playerPositionRef = useRef(150)
  const cpuPositionRef = useRef(150)
  const playerStateRef = useRef("idle")
  const cpuStateRef = useRef("idle")
  const gameOverRef = useRef(false)
  const hitCooldownRef = useRef(false)
  const jumpCooldownRef = useRef(false)
  const attackCooldownRef = useRef(false)

  useEffect(() => {
    playerHealthRef.current = playerHealth
  }, [playerHealth])
  useEffect(() => {
    cpuHealthRef.current = cpuHealth
  }, [cpuHealth])
  useEffect(() => {
    playerPositionRef.current = playerPosition
  }, [playerPosition])
  useEffect(() => {
    cpuPositionRef.current = cpuPosition
  }, [cpuPosition])
  useEffect(() => {
    playerStateRef.current = playerState
  }, [playerState])
  useEffect(() => {
    cpuStateRef.current = cpuState
  }, [cpuState])
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  const FIGHTER_WIDTH = 100
  const PLAYER2_FIGHTER_WIDTH = 90

  const getPlayerCenterX = () => playerPositionRef.current + 70
  const getCpuCenterX = () => window.innerWidth - cpuPositionRef.current - 70

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("[v0] KeyDown event received:", e.key, "code:", e.code)

      // Prevent default for game controls
      if (["KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault()
      }

      // Map keyboard codes to game controls (works with any keyboard layout)
      const keyMap: Record<string, keyof typeof keysRef.current> = {
        KeyA: "a",
        KeyS: "s",
        KeyD: "d",
        ArrowUp: "ArrowUp",
        ArrowDown: "ArrowDown",
        ArrowLeft: "ArrowLeft",
        ArrowRight: "ArrowRight",
      }

      const mappedKey = keyMap[e.code]
      if (mappedKey) {
        keysRef.current[mappedKey] = true
        console.log("[v0] Key set to true:", mappedKey, "Keys state:", JSON.stringify(keysRef.current))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault()
      }

      const keyMap: Record<string, keyof typeof keysRef.current> = {
        KeyA: "a",
        KeyS: "s",
        KeyD: "d",
        ArrowUp: "ArrowUp",
        ArrowDown: "ArrowDown",
        ArrowLeft: "ArrowLeft",
        ArrowRight: "ArrowRight",
      }

      const mappedKey = keyMap[e.code]
      if (mappedKey) {
        keysRef.current[mappedKey] = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOverRef.current) return

      const keys = keysRef.current
      const pState = playerStateRef.current
      const cState = cpuStateRef.current

      const cpuCenterX = getCpuCenterX()
      const playerCenterX = getPlayerCenterX()

      if (pState === "idle") {
        setIsPlayerFacingLeft(playerCenterX > cpuCenterX)
      }
      setIsCpuFacingLeft(cpuCenterX < playerCenterX)

      // Movement
      if (keys.ArrowLeft && pState === "idle") {
        setIsPlayerWalking(true)
        setPlayerPosition((prev) => Math.max(prev - 8, 50))
      } else if (keys.ArrowRight && pState === "idle") {
        setIsPlayerWalking(true)
        setPlayerPosition((prev) => {
          const newPos = Math.min(prev + 8, window.innerWidth - 150)
          const playerRight = newPos + FIGHTER_WIDTH
          const cpuLeft = window.innerWidth - cpuPositionRef.current - PLAYER2_FIGHTER_WIDTH
          return playerRight < cpuLeft ? newPos : prev
        })
      } else if (pState === "idle") {
        setIsPlayerWalking(false)
      }

      // Jump
      if (keys.ArrowUp && pState === "idle" && !jumpCooldownRef.current) {
        setPlayerState("jump")
        setIsPlayerWalking(false)
        jumpCooldownRef.current = true
        setTimeout(() => {
          if (playerStateRef.current === "jump") {
            setPlayerState("idle")
          }
          jumpCooldownRef.current = false
        }, 500)
      }

      // Duck
      if (keys.ArrowDown && pState === "idle") {
        setPlayerState("duck")
        setIsPlayerWalking(false)
      } else if (!keys.ArrowDown && pState === "duck") {
        setPlayerState("idle")
      }

      const distance = Math.abs(cpuCenterX - playerCenterX)
      const isInRange = distance < 150

      // Punch
      if (keys.d && (pState === "idle" || pState === "jump") && !attackCooldownRef.current) {
        console.log("[v0] Punch attack triggered")
        setPlayerState("punch")
        setIsPlayerWalking(false)
        attackCooldownRef.current = true

        if (isInRange && cState !== "jump" && !hitCooldownRef.current) {
          const damage = cState === "defence" ? 1 : 5
          setCpuHealth((prev) => Math.max(0, prev - damage))
          if (cState !== "defence") {
            setIsCpuHit(true)
            setTimeout(() => setIsCpuHit(false), 300)
          }

          hitCooldownRef.current = true
          setTimeout(() => {
            hitCooldownRef.current = false
          }, 500)

          if (cpuHealthRef.current - damage <= 0) {
            endGame("player")
          }
        }

        setTimeout(() => {
          if (playerStateRef.current === "punch") {
            setPlayerState("idle")
          }
          attackCooldownRef.current = false
        }, 300)
      }

      // Kick (including jump kick)
      if (keys.a && !attackCooldownRef.current) {
        console.log("[v0] Kick attack triggered, state:", pState)
        const isJumpKick = pState === "jump"

        if (isJumpKick) {
          setPlayerState("jumpKick")
        } else if (pState === "idle") {
          setPlayerState("kick")
        } else {
          return
        }

        setIsPlayerWalking(false)
        attackCooldownRef.current = true

        if (isInRange && cState !== "jump" && (isJumpKick || cState !== "duck") && !hitCooldownRef.current) {
          const damage = isJumpKick ? 15 : cState === "defence" ? 1 : 10
          setCpuHealth((prev) => Math.max(0, prev - damage))
          if (cState !== "defence") {
            setIsCpuHit(true)
            setTimeout(() => setIsCpuHit(false), 300)
          }

          hitCooldownRef.current = true
          setTimeout(() => {
            hitCooldownRef.current = false
          }, 500)

          if (cpuHealthRef.current - damage <= 0) {
            endGame("player")
          }
        }

        setTimeout(
          () => {
            if (playerStateRef.current === "jumpKick" || playerStateRef.current === "kick") {
              setPlayerState("idle")
            }
            attackCooldownRef.current = false
          },
          isJumpKick ? 400 : 400,
        )
      }

      // Defence
      if (keys.s && pState === "idle" && !attackCooldownRef.current) {
        console.log("[v0] Defense triggered")
        setPlayerState("defence")
        setIsPlayerWalking(false)
        attackCooldownRef.current = true
        setTimeout(() => {
          if (playerStateRef.current === "defence") {
            setPlayerState("idle")
          }
          attackCooldownRef.current = false
        }, 500)
      }

      if (cState === "idle" && Math.random() < 0.6 * difficulty) {
        const botDistance = Math.abs(cpuCenterX - playerCenterX)

        // Bot is more aggressive when close to player
        if (botDistance < 200 && Math.random() < 0.85) {
          const attackType = Math.random()
          if (attackType < 0.4) {
            // Punch
            setCpuState("punch")
            if (botDistance < 150 && pState !== "jump" && !hitCooldownRef.current) {
              const damage = pState === "defence" ? 1 : Math.round(5 * difficulty)
              setPlayerHealth((prev) => Math.max(0, prev - damage))
              if (pState !== "defence") {
                setIsPlayerHit(true)
                setTimeout(() => setIsPlayerHit(false), 300)
              }
              hitCooldownRef.current = true
              setTimeout(() => {
                hitCooldownRef.current = false
              }, 500)
              if (playerHealthRef.current - damage <= 0) {
                endGame("cpu")
              }
            }
            setTimeout(() => setCpuState("idle"), 300)
          } else if (attackType < 0.7) {
            // Kick
            setCpuState("kick")
            if (botDistance < 170 && pState !== "jump" && pState !== "duck" && !hitCooldownRef.current) {
              const damage = pState === "defence" ? 1 : Math.round(10 * difficulty)
              setPlayerHealth((prev) => Math.max(0, prev - damage))
              if (pState !== "defence") {
                setIsPlayerHit(true)
                setTimeout(() => setIsPlayerHit(false), 300)
              }
              hitCooldownRef.current = true
              setTimeout(() => {
                hitCooldownRef.current = false
              }, 500)
              if (playerHealthRef.current - damage <= 0) {
                endGame("cpu")
              }
            }
            setTimeout(() => setCpuState("idle"), 400)
          } else {
            // Defense
            setCpuState("defence")
            setTimeout(() => setCpuState("idle"), 500)
          }
        } else {
          const shouldRetreat = botDistance < 80 && Math.random() < 0.15
          // Always move towards player unless retreating
          const direction = shouldRetreat ? (cpuCenterX > playerCenterX ? 1 : -1) : cpuCenterX > playerCenterX ? -1 : 1

          setIsCpuWalking(true)
          setCpuPosition((prev) => {
            const moveSpeed = 20 // Increased speed for more aggressive movement
            const newPos = Math.max(50, Math.min(window.innerWidth - 150, prev + direction * moveSpeed))

            // Calculate positions for collision detection
            const playerRight = playerPositionRef.current + FIGHTER_WIDTH
            const playerLeft = playerPositionRef.current
            const cpuRight = window.innerWidth - newPos
            const cpuLeft = window.innerWidth - newPos - PLAYER2_FIGHTER_WIDTH

            // Only prevent overlap, don't prevent all movement
            if (direction < 0) {
              // Bot moving towards left (towards player if player is on left)
              // Only block if we would overlap with player
              if (cpuLeft <= playerRight + 20) {
                return prev // Don't move if would overlap
              }
            } else {
              // Bot moving towards right (away from player or towards player on right)
              // Only block if we would overlap with player
              if (cpuRight >= playerLeft - 20) {
                return prev // Don't move if would overlap
              }
            }

            return newPos
          })
          setTimeout(() => setIsCpuWalking(false), 150)
        }
      }
    }, 50)

    return () => clearInterval(gameLoop)
  }, [difficulty])

  const endGame = async (gameWinner: "player" | "cpu") => {
    setGameOver(true)
    setWinner(gameWinner)
    gameOverRef.current = true

    if (isMultiplayer && roomId && currentUserId && hostId) {
      // Determine the actual winner ID based on who won
      const winnerId = gameWinner === "player" ? hostId : currentUserId

      // Save game result to database
      await gameService.finishGame(roomId, winnerId)

      setTimeout(() => {
        router.push(`/results/${roomId}`)
      }, 2000)
    } else {
      setTimeout(() => {
        router.push(
          `/winner?winner=${gameWinner}&player=${playerId}&cpu=${cpuFighter.id}&round=${roundCount}&difficulty=${difficulty.toFixed(1)}&prevOpponents=${previousOpponentsParam}`,
        )
      }, 2000)
    }
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={stageBackground || "/placeholder.svg"}
          alt="Fight Stage"
          fill
          className="object-cover pixelated"
          priority
        />
        <div className="absolute bottom-0 w-full h-20 bg-black/50"></div>
      </div>

      <div className="z-10 flex flex-col items-center justify-start w-full h-full">
        <div className="w-full px-8 pt-4 flex justify-between">
          <PowerBar health={playerHealth} name={playerFighter.name} />
          <PowerBar health={cpuHealth} name={cpuFighter.name} reversed />
        </div>

        <div className="relative flex-1 w-full">
          <Fighter
            fighter={playerFighter}
            position={playerPosition}
            state={playerState}
            side="left"
            jumpDirection={null}
            isDefending={playerState === "defence"}
            isFacingLeft={isPlayerFacingLeft}
            isDefeated={gameOver && winner === "cpu"}
            isVictorious={gameOver && winner === "player"}
            isHit={isPlayerHit}
            isWalking={isPlayerWalking && playerState === "idle"}
            isJumpKicking={playerState === "jumpKick"}
          />

          <Fighter
            fighter={cpuFighter}
            position={cpuPosition}
            state={cpuState}
            side="right"
            isFacingLeft={isCpuFacingLeft}
            isDefeated={gameOver && winner === "player"}
            isVictorious={gameOver && winner === "cpu"}
            isHit={isCpuHit}
            isWalking={isCpuWalking && cpuState === "idle"}
          />
        </div>

        <FightControls />
      </div>
    </div>
  )
}
