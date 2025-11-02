"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { WalletConnector } from "@/components/wallet-connector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Swords, Trophy, Coins, Shield, Zap, Map } from "lucide-react"
import { fighters } from "@/lib/fighters"
import Image from "next/image"

export default function HomePage() {
  const { connected } = useWallet()
  const router = useRouter()

  const battleArenas = [
    {
      name: "Boxi Arena",
      image: "/images/stages/stage-boxi_final.jpg",
      description: "Underground fight club atmosphere",
    },
    {
      name: "Intimes District",
      image: "/images/stages/stage-intimes.jpg",
      description: "Urban street fighting zone",
    },
    {
      name: "Nordkiez Streets",
      image: "/images/stages/stage-nordkiez2.jpg",
      description: "Gritty neighborhood battleground",
    },
    {
      name: "RAW Temple",
      image: "/images/stages/stage-raw1.jpg",
      description: "Industrial warehouse arena",
    },
    {
      name: "RAW Courtyard",
      image: "/images/stages/stage-raw2.jpg",
      description: "Open-air combat zone",
    },
    {
      name: "Rigaer Straße",
      image: "/images/stages/stage-rigaer1.jpg",
      description: "Legendary street location",
    },
  ]

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4108_1px,transparent_1px),linear-gradient(to_bottom,#00ff4108_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center space-y-8 pt-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Swords className="w-20 h-20 text-green-400 animate-pulse" />
              <h1 className="text-8xl font-black game-title text-white">PUMP KOMBAT</h1>
              <Swords className="w-20 h-20 text-lime-400 animate-pulse" />
            </div>
            <p className="text-2xl text-green-400 max-w-3xl mx-auto leading-relaxed font-medium game-text">
              The ultimate crypto-powered fighting arena
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="w-full max-w-md">
            <WalletConnector />
          </div>

          {/* Enter Arena Button */}
          {connected && (
            <Button
              size="lg"
              onClick={() => router.push("/lobby")}
              className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold text-2xl px-16 py-8 rounded-xl shadow-2xl shadow-green-500/50 transition-all hover:scale-105"
            >
              <Swords className="w-6 h-6 mr-3" />
              Enter the Arena
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-3 hover:border-green-500/60 transition-all">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
            <h3 className="text-lg font-bold text-white game-text-white">Competitive Battles</h3>
            <p className="text-sm text-green-400 game-text">Challenge fighters in intense 1v1 combat</p>
          </Card>
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-3 hover:border-green-500/60 transition-all">
            <Coins className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="text-lg font-bold text-white game-text-white">Bet & Win Big</h3>
            <p className="text-sm text-green-400 game-text">Wager tokens and claim massive rewards</p>
          </Card>
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-3 hover:border-green-500/60 transition-all">
            <Shield className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-lg font-bold text-white game-text-white">Provably Fair</h3>
            <p className="text-sm text-green-400 game-text">Transparent outcomes on blockchain</p>
          </Card>
          <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-3 hover:border-green-500/60 transition-all">
            <Zap className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white game-text-white">Instant Payouts</h3>
            <p className="text-sm text-green-400 game-text">Winners receive rewards immediately</p>
          </Card>
        </div>

        {/* Fighters Showcase */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white game-title">Choose Your Fighter</h2>
            <p className="text-xl text-green-400 game-text">Each fighter has unique stats and special moves</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {fighters.map((fighter) => (
              <Card
                key={fighter.id}
                className="bg-black/80 backdrop-blur border-green-500/30 p-4 text-center space-y-3 hover:border-green-500/60 hover:scale-105 transition-all cursor-pointer group"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/50 border-2 border-green-500/20">
                  <Image
                    src={fighter.portrait || "/placeholder.svg"}
                    alt={fighter.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform pixelated"
                  />
                </div>
                <h3 className="text-sm font-bold text-green-400 game-text">{fighter.name}</h3>
                <div className="flex justify-center gap-2 text-xs game-text">
                  <span className="text-red-400">⚔️ {fighter.power}</span>
                  <span className="text-blue-400">⚡ {fighter.speed}</span>
                  <span className="text-green-400">🛡️ {fighter.defense}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Battle Arenas Preview */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Map className="w-12 h-12 text-green-400" />
              <h2 className="text-5xl font-black text-white game-title">Epic Battle Arenas</h2>
            </div>
            <p className="text-xl text-green-400 game-text">Fight in legendary locations with unique atmospheres</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {battleArenas.map((arena) => (
              <Card
                key={arena.name}
                className="bg-black/80 backdrop-blur border-green-500/30 overflow-hidden hover:border-green-500/60 transition-all group"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={arena.image || "/placeholder.svg"}
                    alt={arena.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold text-white mb-1 game-text-white">{arena.name}</h3>
                  <p className="text-sm text-green-400 game-text">{arena.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-green-300/70 text-sm game-text">More arenas coming soon...</p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white game-title">How It Works</h2>
            <p className="text-xl text-green-400 game-text">
              Simple, secure, and transparent - play free for practice or compete for tokens
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Connect Wallet", desc: "Link your Solana wallet to get started" },
              {
                step: "2",
                title: "Create or Join Room",
                desc: "Choose free practice mode or ranked matches with token wagers",
              },
              { step: "3", title: "Battle Begins", desc: "Watch the provably fair fight unfold in real-time" },
              { step: "4", title: "Claim Rewards", desc: "Winner takes 95% of the pot instantly in paid matches" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-600 rounded-full flex items-center justify-center text-3xl font-black text-black mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white game-text-white">{item.title}</h3>
                <p className="text-sm text-green-400 game-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!connected && (
          <div className="text-center space-y-6 py-12">
            <h2 className="text-4xl font-black text-white game-title">Ready to Fight?</h2>
            <p className="text-xl text-green-400 game-text">Connect your wallet and enter the arena now</p>
            <div className="flex justify-center">
              <WalletConnector />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
