import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, hostFighter, betAmount = 0, roomName, map } = body

    console.log("[v0] API: Creating room for wallet:", walletAddress)

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Get user by wallet address
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username")
      .eq("wallet_address", walletAddress)
      .single()

    if (userError || !user) {
      console.error("[v0] API: User not found:", userError?.message)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate room code
    const roomCode = generateRoomCode()

    const roomData: any = {
      room_code: roomCode,
      host_id: user.id,
      host_fighter: hostFighter || user.username,
      bet_amount: betAmount,
      status: "waiting",
    }

    // Only add room_name and map if they exist (columns might not be in DB yet)
    if (roomName) {
      roomData.room_name = roomName
    }
    if (map) {
      roomData.map = map
    }

    console.log("[v0] API: Creating room with data:", roomData)

    // Create room
    const { data: room, error } = await supabase.from("game_rooms").insert(roomData).select().single()

    if (error) {
      console.error("[v0] API: Error creating room:", error.message)

      if (error.message.includes("room_name") || error.message.includes("map")) {
        return NextResponse.json(
          {
            error: "Database needs migration",
            details: "Please run the SQL migration script: scripts/001-add-room-features.sql",
            sqlCommand: `
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS room_name TEXT,
ADD COLUMN IF NOT EXISTS map TEXT DEFAULT 'nordkiez2';
            `.trim(),
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ error: "Failed to create room", details: error.message }, { status: 500 })
    }

    console.log("[v0] API: Room created successfully:", room.id)
    return NextResponse.json({ room })
  } catch (error) {
    console.error("[v0] API: Error in create room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
