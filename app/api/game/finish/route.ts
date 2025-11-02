import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, winnerId } = body

    console.log("[v0] API: Finishing game:", roomId, "winner:", winnerId)

    if (!roomId || !winnerId) {
      return NextResponse.json({ error: "Room ID and winner ID required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Get room details
    const { data: room, error: roomError } = await supabase.from("game_rooms").select("*").eq("id", roomId).single()

    if (roomError || !room) {
      console.error("[v0] API: Room not found:", roomError?.message)
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Update room status
    const { error: updateError } = await supabase
      .from("game_rooms")
      .update({
        status: "completed",
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    if (updateError) {
      console.error("[v0] API: Error updating room:", updateError)
      return NextResponse.json({ error: "Failed to update room", details: updateError.message }, { status: 500 })
    }

    // Record game result
    const loserId = winnerId === room.host_id ? room.opponent_id : room.host_id
    const winnerFighter = winnerId === room.host_id ? room.host_fighter : room.opponent_fighter
    const loserFighter = winnerId === room.host_id ? room.opponent_fighter : room.host_fighter

    const { error: resultError } = await supabase.from("game_results").insert({
      room_id: roomId,
      winner_id: winnerId,
      loser_id: loserId,
      winner_fighter: winnerFighter,
      loser_fighter: loserFighter,
      bet_amount: room.bet_amount,
      winner_payout: room.bet_amount * 2,
    })

    if (resultError) {
      console.error("[v0] API: Error recording result:", resultError)
    }

    // Update winner stats
    const { data: winner } = await supabase.from("users").select("wins, total_games").eq("id", winnerId).single()

    if (winner) {
      await supabase
        .from("users")
        .update({
          wins: winner.wins + 1,
          total_games: winner.total_games + 1,
        })
        .eq("id", winnerId)
    }

    // Update loser stats
    if (loserId) {
      const { data: loser } = await supabase.from("users").select("losses, total_games").eq("id", loserId).single()

      if (loser) {
        await supabase
          .from("users")
          .update({
            losses: loser.losses + 1,
            total_games: loser.total_games + 1,
          })
          .eq("id", loserId)
      }
    }

    console.log("[v0] API: Game finished successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API: Error in finish game:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
