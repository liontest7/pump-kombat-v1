"use client"

import { Card } from "@/components/ui/card"
import { fighters } from "@/lib/fighters"

interface FighterSelectProps {
  onSelect: (fighter: string) => void
}

export function FighterSelect({ onSelect }: FighterSelectProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {fighters.map((fighter) => (
        <Card
          key={fighter.id}
          className="bg-slate-900/50 backdrop-blur border-purple-500/20 hover:border-purple-500/60 cursor-pointer transition-all group p-4"
          onClick={() => onSelect(fighter.name)}
        >
          <div className="text-center space-y-2">
            <div className="text-4xl">{fighter.avatar}</div>
            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{fighter.name}</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Power: {fighter.power}</div>
              <div>Speed: {fighter.speed}</div>
              <div>Defense: {fighter.defense}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
