import { Connection, type PublicKey } from "@solana/web3.js"

const ESCROW_WALLET = "EscrowWa11et1111111111111111111111111111111"
const PLATFORM_FEE = 0.05 // 5%

export interface BetTransaction {
  signature: string
  from: string
  amount: number
  timestamp: number
  status: "pending" | "confirmed" | "failed"
}

export class SolanaService {
  private connection: Connection

  constructor(network: "devnet" | "mainnet-beta" = "devnet") {
    this.connection = new Connection(
      network === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com",
    )
  }

  async getTokenBalance(publicKey: PublicKey): Promise<number> {
    try {
      // In production, this will fetch the actual token balance from the blockchain
      // For now, return a mock balance
      return 1000 + Math.random() * 5000
    } catch (error) {
      console.error("[v0] Error fetching token balance:", error)
      return 0
    }
  }

  async checkSufficientBalance(publicKey: PublicKey, amount: number): Promise<boolean> {
    const balance = await this.getTokenBalance(publicKey)
    return balance >= amount
  }

  // Mock function for development - simulates placing a bet
  async placeBet(fromPublicKey: PublicKey, amount: number, roomId: string): Promise<BetTransaction> {
    console.log("[v0] Placing bet:", { from: fromPublicKey.toString(), amount, roomId })

    // In development, we simulate the transaction
    const mockTransaction: BetTransaction = {
      signature: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: fromPublicKey.toString(),
      amount,
      timestamp: Date.now(),
      status: "confirmed",
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return mockTransaction
  }

  // Mock function for development - simulates distributing winnings
  async distributeWinnings(toPublicKey: PublicKey, totalPot: number, roomId: string): Promise<BetTransaction> {
    console.log("[v0] Distributing winnings:", { to: toPublicKey.toString(), totalPot, roomId })

    const platformFee = totalPot * PLATFORM_FEE
    const winnerAmount = totalPot - platformFee

    const mockTransaction: BetTransaction = {
      signature: `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: ESCROW_WALLET,
      amount: winnerAmount,
      timestamp: Date.now(),
      status: "confirmed",
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Winner receives:", winnerAmount, "TOKENS (Platform fee:", platformFee, "TOKENS)")

    return mockTransaction
  }

  // Generate provably fair seed
  generateSeed(): string {
    return `seed_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }

  // Verify seed (for transparency)
  verifySeed(seed: string, player1: string, player2: string): boolean {
    // In production, this would verify the seed against blockchain data
    console.log("[v0] Verifying seed:", { seed, player1, player2 })
    return seed.startsWith("seed_")
  }

  // Calculate fight outcome based on seed and fighter stats
  calculateFightOutcome(
    seed: string,
    fighter1: { name: string; power: number; speed: number; defense: number },
    fighter2: { name: string; power: number; speed: number; defense: number },
  ): { winner: 1 | 2; rounds: number } {
    // Use seed to generate deterministic random number
    const seedNum = Number.parseInt(seed.split("_")[1] || "0")
    const random = (seedNum % 100) / 100

    // Calculate total stats
    const fighter1Total = fighter1.power + fighter1.speed + fighter1.defense
    const fighter2Total = fighter2.power + fighter2.speed + fighter2.defense

    // Add some randomness based on seed
    const fighter1Score = fighter1Total + random * 10
    const fighter2Score = fighter2Total + (1 - random) * 10

    const winner = fighter1Score > fighter2Score ? 1 : 2
    const rounds = Math.floor(random * 3) + 1 // 1-3 rounds

    console.log("[v0] Fight outcome:", {
      seed,
      fighter1Score,
      fighter2Score,
      winner,
      rounds,
    })

    return { winner, rounds }
  }
}

export const solanaService = new SolanaService()
