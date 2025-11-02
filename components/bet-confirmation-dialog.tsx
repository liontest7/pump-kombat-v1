"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { solanaService } from "@/lib/solana-service"

interface BetConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  betAmount: number
  roomName: string
  onConfirm: (signature: string) => void
}

export function BetConfirmationDialog({
  open,
  onOpenChange,
  betAmount,
  roomName,
  onConfirm,
}: BetConfirmationDialogProps) {
  const { publicKey } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSufficientBalance, setHasSufficientBalance] = useState(true)

  const platformFee = betAmount * 0.05
  const totalCost = betAmount + 0.001 // Add gas fee estimate

  const handleConfirm = async () => {
    if (!publicKey) return

    setIsProcessing(true)
    setError(null)

    try {
      // Check balance
      const sufficient = await solanaService.checkSufficientBalance(publicKey, betAmount)
      if (!sufficient) {
        setHasSufficientBalance(false)
        setError("Insufficient balance. Please add more SOL to your wallet.")
        setIsProcessing(false)
        return
      }

      // Place bet (mock transaction in development)
      const transaction = await solanaService.placeBet(publicKey, betAmount, roomName)

      if (transaction.status === "confirmed") {
        onConfirm(transaction.signature)
        onOpenChange(false)
      } else {
        setError("Transaction failed. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Bet confirmation error:", err)
      setError("Failed to process bet. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Confirm Your Bet</DialogTitle>
          <DialogDescription className="text-slate-400">Review the details before placing your bet</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Room Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Room:</span>
              <span className="text-white font-medium">{roomName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Bet Amount:</span>
              <span className="text-white font-medium">{betAmount} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Platform Fee (5%):</span>
              <span className="text-yellow-400 font-medium">{platformFee.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Est. Gas Fee:</span>
              <span className="text-slate-400">~0.001 SOL</span>
            </div>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total Cost:</span>
                <span className="text-white font-bold">{totalCost.toFixed(4)} SOL</span>
              </div>
            </div>
          </div>

          {/* Potential Winnings */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">Potential Winnings</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{(betAmount * 2 * 0.95).toFixed(4)} SOL</p>
            <p className="text-xs text-slate-400 mt-1">If you win (95% of total pot)</p>
          </div>

          {/* Warnings */}
          {!hasSufficientBalance && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                Insufficient balance. You need at least {totalCost.toFixed(4)} SOL.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-400">
              Your bet will be held in escrow until the fight is complete. The winner receives 95% of the total pot,
              with 5% going to platform fees.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !hasSufficientBalance}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Bet
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
