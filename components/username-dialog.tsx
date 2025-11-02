"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface UsernameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (username: string) => Promise<void>
  currentUsername?: string
  isFirstTime?: boolean
}

export function UsernameDialog({
  open,
  onOpenChange,
  onSubmit,
  currentUsername,
  isFirstTime = false,
}: UsernameDialogProps) {
  const [username, setUsername] = useState(currentUsername || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    const finalUsername = username.trim() || currentUsername || ""

    if (!finalUsername) {
      setError("Username is required")
      return
    }

    if (finalUsername.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (finalUsername.length > 20) {
      setError("Username must be less than 20 characters")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onSubmit(finalUsername)
      if (isFirstTime) {
        localStorage.setItem("username_setup_complete", "true")
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isFirstTime ? undefined : onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 game-title flex items-center gap-2">
            <User className="w-6 h-6" />
            {isFirstTime ? "Choose Your Username" : "Change Username"}
          </DialogTitle>
          <DialogDescription className="text-green-300/70">
            {isFirstTime
              ? "Welcome! Choose a username that will be displayed in battles and leaderboards, or keep your default name."
              : "Update your display name for battles and leaderboards."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-green-400">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              maxLength={20}
              className="bg-black/50 border-green-500/30 text-green-400"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <p className="text-xs text-green-300/70">3-20 characters, will be visible to all players</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isFirstTime && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
