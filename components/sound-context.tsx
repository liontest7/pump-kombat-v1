"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundContextType = {
  isMuted: boolean
  toggleMute: () => void
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
})

export const useSoundContext = () => useContext(SoundContext)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pumpKombatMuted")
      return saved === "true"
    }
    return false
  })
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Urban%20Battle%20Royale%20ext%20v1-ArQZKBcqLavgph03c31fyP8GhzjMSK.mp3")
    audioElement.loop = true
    setAudio(audioElement)

    // Clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [])

  useEffect(() => {
    if (!audio) return

    if (isMuted) {
      audio.pause()
    } else {
      // Only play if the document has been interacted with
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented, we'll need user interaction
          console.log("Audio playback was prevented:", error)
        })
      }
    }
  }, [audio, isMuted])

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newValue = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("pumpKombatMuted", String(newValue))
      }
      return newValue
    })
  }

  return <SoundContext.Provider value={{ isMuted, toggleMute }}>{children}</SoundContext.Provider>
}
