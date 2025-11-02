import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: rooms, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rooms:", error)
      return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
    }

    return NextResponse.json({ rooms: rooms || [] })
  } catch (error) {
    console.error("Error in list rooms API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
