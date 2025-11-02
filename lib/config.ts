export const siteConfig = {
  // Admin Configuration
  admin: {
    wallets: ["DajB37qp74UzwND3N1rVWtLdxr55nhvuK2D4x476zmns"], // Admin wallet addresses
  },

  // Token Information
  token: {
    name: "PUMP KOMBAT",
    symbol: "PKT", // Changed from PUMP to PKT as requested
    ticker: "PKT", // Added ticker for display
    address: "TBD", // Token contract address - update this when token is deployed
    decimals: 9,
  },

  // Social Links
  social: {
    twitter: "https://twitter.com/pumpkombat",
    telegram: "https://t.me/pumpkombat",
    discord: "https://discord.gg/pumpkombat",
  },

  // Buy Links
  buy: {
    pumpFun: "https://pump.fun/", // Add your pump.fun link
    raydium: "", // Add Raydium link when available
    jupiter: "", // Add Jupiter link when available
  },

  // Game Settings
  game: {
    platformFee: 0.05, // 5% platform fee
    minBetAmount: 0.01, // Minimum bet in SOL
    maxBetAmount: 10, // Maximum bet in SOL
    roundDuration: 90, // seconds
    freePlayEnabled: true, // Enable free practice mode
  },

  // Site Metadata
  site: {
    name: "PUMP KOMBAT",
    description: "The ultimate crypto-powered fighting arena on Solana",
    url: "https://pumpkombat.com",
  },
} as const

// Helper function to check if a wallet is an admin
export function isAdmin(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false
  return siteConfig.admin.wallets.includes(walletAddress)
}
