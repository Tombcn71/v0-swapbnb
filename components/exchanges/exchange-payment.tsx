"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Shield } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangePaymentProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangePayment({ exchange, isRequester }: ExchangePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const userPaymentStatus = isRequester ? exchange.requester_payment_status : exchange.host_payment_status
  const userIdentityStatus = isRequester
    ? exchange.requester_identity_verification_status
    : exchange.host_identity_verification_status

  const otherPaymentStatus = isRequester ? exchange.host_payment_status : exchange.requester_payment_status
  const otherIdentityStatus = isRequester
    ? exchange.host_identity_verification_status
    : exchange.requester_identity_verification_status

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment session")
      }

      const { url } = await response.json()

      // Redirect naar Stripe Checkout
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Betaling mislukt",
        description: error.message || "Er is iets misgegaan met de betaling. Probeer het opnieuw.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleIdentityVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/identity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create identity verification session")
      }

      const { url } = await response.json()

      // Redirect naar Stripe Identity
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Verificatie mislukt",
        description: error.message || "Er is iets misgegaan met de verificatie. Probeer het opnieuw.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "verified":
        return <Badge className="bg-green-100 text-green-800">✓ Voltooid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ In behandeling</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">✗ Mislukt</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Alleen tonen als de videocall voltooid is
  if (
    exchange.status !== "videocall_completed" &&
    exchange.status !== "payment_pending" &&
    exchange.status !== "completed"
  ) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Betaling & ID-Verificatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uitleg */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Laatste stap!</h4>
          <p className="text-blue-800 text-sm">
            Beide partijen moeten een swap fee van €20 betalen en hun identiteit verifiëren via Stripe. Dit zorgt voor
            veiligheid en vertrouwen in het platform.
          </p>
        </div>

        {/* Jouw status */}
        <div className="space-y-4">
          <h4 className="font-medium">Jouw status</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm">Swap fee (€20)</span>
            {getStatusBadge(userPaymentStatus)}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">ID-verificatie</span>
            {getStatusBadge(userIdentityStatus)}
          </div>

          {/* Betaling knop */}
          {userPaymentStatus === "pending" && (
            <Button onClick={handlePayment} disabled={isLoading} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? "Doorsturen naar Stripe..." : "Betaal swap fee (€20)"}
            </Button>
          )}

          {/* ID verificatie knop */}
          {userIdentityStatus === "pending" && userPaymentStatus === "paid" && (
            <Button onClick={handleIdentityVerification} disabled={isLoading} variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {isLoading ? "Doorsturen naar verificatie..." : "Verifieer identiteit"}
            </Button>
          )}

          {/* Beide voltooid */}
          {userPaymentStatus === "paid" && userIdentityStatus === "verified" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">✓ Jouw deel is voltooid!</p>
              <p className="text-green-700 text-sm mt-1">Wacht tot de andere partij ook klaar is.</p>
            </div>
          )}
        </div>

        {/* Andere partij status */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Status andere partij</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm">Swap fee</span>
            {getStatusBadge(otherPaymentStatus)}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">ID-verificatie</span>
            {getStatusBadge(otherIdentityStatus)}
          </div>
        </div>

        {/* Voortgang indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Totale voortgang</span>
            <span className="font-medium">
              {
                [userPaymentStatus, userIdentityStatus, otherPaymentStatus, otherIdentityStatus].filter(
                  (status) => status === "paid" || status === "verified",
                ).length
              }{" "}
              / 4 voltooid
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ([userPaymentStatus, userIdentityStatus, otherPaymentStatus, otherIdentityStatus].filter(
                    (status) => status === "paid" || status === "verified",
                  ).length /
                    4) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Alle stappen voltooid */}
        {userPaymentStatus === "paid" &&
          userIdentityStatus === "verified" &&
          otherPaymentStatus === "paid" &&
          otherIdentityStatus === "verified" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-900 mb-2">🎉 Swap voltooid!</h4>
              <p className="text-green-800 text-sm">
                Beide partijen hebben betaald en zijn geverifieerd. De swap is nu officieel bevestigd!
              </p>
            </div>
          )}

        {/* Veiligheid info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-gray-700 text-sm">
            <strong>Veilig:</strong> Alle betalingen en verificaties worden verwerkt door Stripe, een van de meest
            vertrouwde betalingsproviders ter wereld.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
