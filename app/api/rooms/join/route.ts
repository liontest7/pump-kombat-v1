import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, roomId, fighter } = body

    console.log("[v0] API: Joining room:", roomId, "for wallet:", walletAddress)

    if (!walletAddress || !roomId || !fighter) {
      return NextResponse.json({ error: "Wallet address, room ID and fighter required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Get user by wallet address
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single()

    if (userError || !user) {
      console.error("[v0] API: User not found:", userError?.message)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if room exists and is waiting
    const { data: room, error: fetchError } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .eq("status", "waiting")
      .single()

    if (fetchError || !room) {
      console.error("[v0] API: Room not found or not available:", fetchError?.message)
      return NextResponse.json({ error: "Room not found or not available" }, { status: 404 })
    }

    // Join room
    const { data: updatedRoom, error: updateError } = await supabase
      .from("game_rooms")
      .update({
        opponent_id: user.id,
        opponent_fighter: fighter,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] API: Error joining room:", updateError)
      return NextResponse.json({ error: "Failed to join room", details: updateError.message }, { status: 500 })
    }

    console.log("[v0] API: Room joined successfully:", updatedRoom.id)
    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error("[v0] API: Error in join room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
