import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId } = body

    console.log("[v0] API: Bot joining room:", roomId)

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

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

    // Check if room is free (bots only allowed in free rooms)
    if (room.bet_amount !== 0) {
      return NextResponse.json({ error: "Bots are only allowed in free practice rooms" }, { status: 400 })
    }

    const botWallet = `BOT_${Math.random().toString(36).substr(2, 9)}`
    const botUsername = `AI_Fighter_${Math.floor(Math.random() * 1000)}`

    // Generate UUID manually using crypto.randomUUID()
    const botId = crypto.randomUUID()

    // Insert bot user with explicit ID to avoid null constraint violation
    const { error: insertError } = await supabase.from("users").insert({
      id: botId,
      wallet_address: botWallet,
      username: botUsername,
    })

    if (insertError) {
      console.error("[v0] API: Error creating bot user:", insertError.message)
      return NextResponse.json({ error: "Failed to create bot user" }, { status: 500 })
    }

    // Now query for the bot user we just created
    const { data: botUser, error: botUserError } = await supabase.from("users").select("*").eq("id", botId).single()

    if (botUserError || !botUser) {
      console.error("[v0] API: Error fetching bot user:", botUserError?.message)
      return NextResponse.json({ error: "Failed to fetch bot user" }, { status: 500 })
    }

    // Select random fighter for bot
    const fighters = ["the-schorsch", "dave-radau", "jensator", "justus-jonas", "paddy", "nico-rohstahl"]
    const randomFighter = fighters[Math.floor(Math.random() * fighters.length)]

    console.log("[v0] API: Bot selected fighter:", randomFighter)

    // Join room with bot
    const { data: updatedRoom, error: updateError } = await supabase
      .from("game_rooms")
      .update({
        opponent_id: botUser.id,
        opponent_fighter: randomFighter,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] API: Error joining room with bot:", updateError)
      return NextResponse.json({ error: "Failed to join room with bot" }, { status: 500 })
    }

    console.log("[v0] API: Bot joined room successfully:", updatedRoom.id)
    return NextResponse.json({ room: updatedRoom, bot: { username: botUsername, fighter: randomFighter } })
  } catch (error) {
    console.error("[v0] API: Error in join bot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
