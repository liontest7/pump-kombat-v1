"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, Twitter, MessageCircle, ShoppingCart, Shield, Zap, Trophy, Copy, Check, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { siteConfig } from "@/lib/config"
import { useState } from "react"

export default function AboutPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(siteConfig.token.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4108_1px,transparent_1px),linear-gradient(to_bottom,#00ff4108_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Swords className="w-16 h-16 text-green-400" />
            <h1 className="text-6xl font-black game-title">ABOUT PUMP KOMBAT</h1>
            <Swords className="w-16 h-16 text-lime-400" />
          </div>
          <p className="text-xl text-green-400 max-w-3xl mx-auto game-text">
            The ultimate crypto-powered fighting arena on Solana blockchain
          </p>
        </div>

        {/* What is Pump Kombat */}
        <Card className="bg-black/80 backdrop-blur border-green-500/30 p-8">
          <h2 className="text-3xl font-black text-white mb-6 game-title">What is Pump Kombat?</h2>
          <div className="space-y-4 text-green-300 game-text">
            <p>
              Pump Kombat is a revolutionary blockchain-based fighting game that combines classic arcade-style combat
              with the power of cryptocurrency. Built on the Solana blockchain, our platform offers both free practice
              modes and competitive ranked matches where players can wager tokens and win big.
            </p>
            <p>
              Choose from a diverse roster of unique fighters, each with their own stats and special moves. Battle in
              legendary arenas across iconic locations, and prove your skills in intense 1v1 combat.
            </p>
            <p>
              Whether you're playing for fun or competing for tokens, every fight is provably fair and transparent, with
              outcomes verified on the blockchain.
            </p>
          </div>
        </Card>

        {/* Game Modes */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white text-center game-title">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-blue-400" />
                <h3 className="text-2xl font-bold text-white game-text">Free Practice Mode</h3>
              </div>
              <p className="text-green-400 game-text">
                Perfect your skills and learn fighter mechanics without any risk. Practice against AI opponents, test
                different strategies, and master your favorite fighters before entering ranked matches.
              </p>
            </Card>
            <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white game-text">Ranked Matches</h3>
              </div>
              <p className="text-green-400 game-text">
                Compete for real tokens in ranked battles. Create or join rooms with custom wagers, and fight for the
                pot. Winners receive 95% of the total pot, with outcomes verified on-chain for complete transparency.
              </p>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white text-center game-title">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-4">
              <Shield className="w-12 h-12 text-blue-400 mx-auto" />
              <h3 className="text-xl font-bold text-white game-text">Provably Fair</h3>
              <p className="text-sm text-green-400">
                Every fight outcome is verifiable on the blockchain using cryptographic seeds
              </p>
            </Card>
            <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-4">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto" />
              <h3 className="text-xl font-bold text-white game-text">Instant Payouts</h3>
              <p className="text-sm text-green-400">Winners receive their rewards immediately after each match</p>
            </Card>
            <Card className="bg-black/80 backdrop-blur border-green-500/30 p-6 text-center space-y-4">
              <Coins className="w-12 h-12 text-green-400 mx-auto" />
              <h3 className="text-xl font-bold text-white game-text">Low Fees</h3>
              <p className="text-sm text-green-400">Only 5% platform fee, 95% goes directly to the winner</p>
            </Card>
          </div>
        </div>

        {/* Buy Tokens */}
        <Card className="bg-gradient-to-br from-green-900/30 via-black to-lime-900/30 backdrop-blur border-green-500/30 p-8 text-center space-y-6">
          <h2 className="text-3xl font-black text-white game-title">Get Tokens</h2>
          <p className="text-xl text-green-300 game-text max-w-2xl mx-auto">
            Purchase tokens to participate in ranked matches and compete for bigger rewards
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => window.open(siteConfig.buy.pumpFun, "_blank")}
              className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold text-lg px-8 py-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy on Pump.fun
            </Button>
          </div>
        </Card>

        {/* Token Information */}
        <Card className="bg-black/80 backdrop-blur border-green-500/30 p-8">
          <h2 className="text-3xl font-black text-white text-center mb-8 game-title">Token Information</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400/60 mb-1">Token Name</p>
                <p className="text-xl font-bold text-white game-text">{siteConfig.token.name}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400/60 mb-1">Token Symbol</p>
                <p className="text-xl font-bold text-white game-text">{siteConfig.token.ticker}</p>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-400/60 mb-2">Contract Address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-white font-mono bg-black/50 px-3 py-2 rounded border border-green-500/20 break-all">
                  {siteConfig.token.address}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="border-green-500/30 hover:bg-green-500/10 text-green-400 shrink-0 bg-transparent"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="bg-black/80 backdrop-blur border-green-500/30 p-8">
          <h2 className="text-3xl font-black text-white text-center mb-8 game-title">Join Our Community</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(siteConfig.social.twitter, "_blank")}
              className="border-green-500/30 hover:bg-green-500/10 text-white"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(siteConfig.social.telegram, "_blank")}
              className="border-green-500/30 hover:bg-green-500/10 text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Telegram
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(siteConfig.social.discord, "_blank")}
              className="border-green-500/30 hover:bg-green-500/10 text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Discord
            </Button>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-4xl font-black text-white game-title">Ready to Fight?</h2>
          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-black font-bold text-xl px-12 py-6"
          >
            <Swords className="w-6 h-6 mr-3" />
            Enter the Arena
          </Button>
        </div>
      </div>
    </div>
  )
}
