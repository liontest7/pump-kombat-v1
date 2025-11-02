"use client"

import { useState, useEffect, useCallback } from "react"

export function useKeyboardControls() {
  const [keys, setKeys] = useState<Record<string, boolean>>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    s: false,
    d: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keys) {
        setKeys((prev) => ({ ...prev, [e.key]: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys) {
        setKeys((prev) => ({ ...prev, [e.key]: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const resetKeys = useCallback((keysToReset: string[]) => {
    setKeys((prev) => {
      const newKeys = { ...prev }
      keysToReset.forEach((key) => {
        if (key in newKeys) {
          newKeys[key] = false
        }
      })
      return newKeys
    })
  }, [])

  return {
    isKeyDown: keys,
    resetKeys,
  }
}
