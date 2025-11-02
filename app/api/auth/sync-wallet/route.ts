import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] Syncing wallet:", walletAddress)
    const supabase = await createAdminClient()

    // First, try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Error fetching user:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // If user exists, return it
    if (existingUser) {
      console.log("[v0] User already exists:", existingUser.id)
      return NextResponse.json({ user: existingUser })
    }

    const userId = crypto.randomUUID()
    console.log("[v0] Creating new user with ID:", userId)

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        wallet_address: walletAddress,
        username: `Player_${walletAddress.slice(0, 6)}`,
        token_balance: 0,
        wins: 0,
        losses: 0,
        total_games: 0,
        ranking_points: 1000,
      })
      .select()
      .single()

    if (insertError && insertError.code === "23503" && insertError.message.includes("users_id_fkey")) {
      console.log("[v0] Foreign key constraint detected, attempting to fix...")

      // Try to drop the constraint using raw SQL
      try {
        await supabase.rpc("exec_sql", {
          sql: "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;",
        })
        console.log("[v0] Constraint dropped, retrying user creation...")

        // Retry the insert
        const { data: retryUser, error: retryError } = await supabase
          .from("users")
          .insert({
            id: userId,
            wallet_address: walletAddress,
            username: `Player_${walletAddress.slice(0, 6)}`,
            token_balance: 0,
            wins: 0,
            losses: 0,
            total_games: 0,
            ranking_points: 1000,
          })
          .select()
          .single()

        if (retryError) {
          console.error("[v0] Retry failed:", retryError)
          return NextResponse.json(
            {
              error: "Database configuration issue",
              details: retryError.message,
              sqlCommand: "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;",
            },
            { status: 500 },
          )
        }

        console.log("[v0] User created successfully after fix:", retryUser.id)
        return NextResponse.json({ user: retryUser })
      } catch (fixError) {
        console.error("[v0] Could not fix constraint:", fixError)
        return NextResponse.json(
          {
            error: "Database configuration issue - manual fix required",
            sqlCommand: "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;",
            technicalDetails: insertError.message,
          },
          { status: 500 },
        )
      }
    }

    if (insertError) {
      console.error("[v0] Error creating user:", insertError.message, insertError.details)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[v0] New wallet user created successfully:", newUser.id)
    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("[v0] Exception in sync-wallet API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
