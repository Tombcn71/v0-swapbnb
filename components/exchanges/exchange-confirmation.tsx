"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange } from "@/lib/types"

interface ExchangeConfirmationProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
  onStatusUpdate: () => void
}

export function ExchangeConfirmation({
  exchange,
  currentUserId,
  isRequester,
  isHost,
  onStatusUpdate,
}: ExchangeConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    setIsConfirming(true)

    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()

        if (data.free_swap) {
          // Free swap confirmed
          toast({
            title: data.both_confirmed ? "🎉 Swap Bevestigd!" : "✅ Bevestiging Geregistreerd",
            description: data.message,
          })
          onStatusUpdate()
        } else {
          // Redirect to Stripe
          if (data.checkout_url) {
            window.location.href = data.checkout_url
          }
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm exchange")
      }
    } catch (error: any) {
      console.error("Error confirming exchange:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het bevestigen van de swap.",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  // Check confirmation status
  const currentUserConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed
  const bothConfirmed = currentUserConfirmed && otherUserConfirmed

  if (exchange.status !== "accepted") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Swap Bevestiging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium mb-2">
            ✅ Swap geaccepteerd! Nu moeten beide partijen de swap bevestigen.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Jouw bevestiging:</span>
              <span className={currentUserConfirmed ? "text-green-600 font-medium" : "text-orange-600"}>
                {currentUserConfirmed ? "✓ Bevestigd" : "⏳ Nog te bevestigen"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Andere partij:</span>
              <span className={otherUserConfirmed ? "text-green-600 font-medium" : "text-orange-600"}>
                {otherUserConfirmed ? "✓ Bevestigd" : "⏳ Nog te bevestigen"}
              </span>
            </div>
          </div>
        </div>

        {!currentUserConfirmed && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">Eerste swap gratis!</span>
              </div>
              <p className="text-blue-700 text-sm">Je eerste swap is gratis. Daarna kost elke swap €5,- per persoon.</p>
            </div>

            <Button onClick={handleConfirm} disabled={isConfirming} className="w-full bg-green-600 hover:bg-green-700">
              {isConfirming ? (
                "Bevestigen..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Bevestig Swap
                </>
              )}
            </Button>
          </div>
        )}

        {currentUserConfirmed && !otherUserConfirmed && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              ✓ Je hebt de swap bevestigd! Wacht tot de andere partij ook bevestigt.
            </p>
          </div>
        )}

        {bothConfirmed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              🎉 Beide partijen hebben bevestigd! De swap is nu definitief.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
