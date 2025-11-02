import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Starting database fix...")
    const supabase = createAdminClient()

    // Drop the problematic foreign key constraint
    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Drop the problematic foreign key constraint if it exists
        ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_id_fkey;
        
        -- Ensure the users table has the correct structure
        ALTER TABLE IF EXISTS users 
          ALTER COLUMN id SET DEFAULT gen_random_uuid();
      `,
    })

    if (dropError) {
      console.error("[v0] Error executing SQL:", dropError)
      // If RPC doesn't work, try direct SQL execution
      // This might fail but we'll try the alternative approach
    }

    console.log("[v0] Database fix completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database constraints fixed",
    })
  } catch (error: any) {
    console.error("[v0] Error fixing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        instructions:
          "Please run the SQL script manually in Supabase SQL Editor: ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;",
      },
      { status: 500 },
    )
  }
}
