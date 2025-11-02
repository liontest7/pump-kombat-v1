"use client"

import { createClient } from "@/lib/supabase/client"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"

export interface WalletUser {
  id: string
  wallet_address: string
  username: string
  token_balance: number
  wins: number
  losses: number
  total_games: number
  ranking_points: number
}

/**
 * Hook to sync wallet connection with database user
 * Automatically creates user on first wallet connection
 */
export function useWalletAuth() {
  const { publicKey, connected } = useWallet()
  const [user, setUser] = useState<WalletUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsManualFix, setNeedsManualFix] = useState(false)
  const [fixInstructions, setFixInstructions] = useState<string | null>(null)

  useEffect(() => {
    async function syncWalletUser() {
      if (!connected || !publicKey) {
        setUser(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      setNeedsManualFix(false)
      setFixInstructions(null)

      try {
        const walletAddress = publicKey.toString()

        const response = await fetch("/api/auth/sync-wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress }),
        })

        if (!response.ok) {
          const errorData = await response.json()

          if (errorData.sqlCommand) {
            setNeedsManualFix(true)
            setFixInstructions(errorData.sqlCommand)
            setError("Database configuration issue - manual fix required")
          } else {
            setError(errorData.error || "Failed to sync wallet")
          }

          console.error("[v0] Failed to sync user:", errorData)
          return
        }

        const { user: syncedUser } = await response.json()
        console.log("[v0] Wallet user synced:", syncedUser)
        setUser(syncedUser)
      } catch (err) {
        console.error("[v0] Error in wallet auth:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    syncWalletUser()
  }, [connected, publicKey])

  const refreshUser = async () => {
    if (!connected || !publicKey) return

    try {
      const walletAddress = publicKey.toString()
      console.log("[v0] Refreshing user data for wallet:", walletAddress)

      const response = await fetch("/api/auth/sync-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (response.ok) {
        const { user: syncedUser } = await response.json()
        console.log("[v0] User data refreshed:", syncedUser)
        setUser(syncedUser)
      } else {
        console.error("[v0] Failed to refresh user:", await response.text())
      }
    } catch (err) {
      console.error("[v0] Error refreshing user:", err)
    }
  }

  return { user, isLoading, error, isAuthenticated: !!user, needsManualFix, fixInstructions, refreshUser }
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<WalletUser | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("users").select("*").eq("wallet_address", walletAddress).single()

  if (error) {
    console.error("[v0] Error fetching user by wallet:", error)
    return null
  }

  return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: Partial<Pick<WalletUser, "username">>,
): Promise<boolean> {
  const supabase = createClient()

  console.log("[v0] Updating user profile:", { walletAddress, updates })

  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()

  if (error) {
    console.error("[v0] Error updating user profile:", error)
    return false
  }

  console.log("[v0] User profile updated successfully:", data)
  return true
}
