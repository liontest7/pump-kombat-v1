import { siteConfig } from "./config"

/**
 * Check if a wallet address is an admin
 */
export function isAdmin(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false
  return siteConfig.admin.wallets.includes(walletAddress)
}
