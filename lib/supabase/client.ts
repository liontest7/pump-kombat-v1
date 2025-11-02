import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gvlvzyeagcgucrnjtilu.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bHZ6eWVhZ2NndWNybmp0aWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2MzEsImV4cCI6MjA3Njg3NzYzMX0.3xmiDPKFLIzfMBwaQA2jndgs7KOj5ZPgzc9VN889Hs4"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
