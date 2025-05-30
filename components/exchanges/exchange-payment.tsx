"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Shield, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import type { Exchange } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"

interface ExchangePaymentProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangePayment({ exchange, isRequester }: ExchangePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check voor verification_complete parameter
  useEffect(() => {
    const verificationComplete = searchParams.get("verification_complete")

    if (verificationComplete === "true") {
      toast({
        title: "Verificatie ontvangen",
        description: "Je identiteitsverificatie is ontvangen en wordt verwerkt.",
      })

      // Verwijder de query parameter
      const url = new URL(window.location.href)
      url.searchParams.delete("verification_complete")
      router.replace(url.pathname)

      // Refresh de exchange data
      refreshExchange()
    }
  }, [searchParams])

  const refreshExchange = async () => {
    setRefreshing(true)
    try {
      // Wacht even om de server tijd te geven om de webhook te verwerken
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.refresh()
    } finally {
      setRefreshing(false)
    }
  }

  const userPaymentStatus = isRequester ? exchange.requester_payment_status : exchange.host_payment_status
  const userIdentityStatus = isRequester
    ? exchange.requester_identity_verification_status
    : exchange.host_identity_verification_status

  const otherPaymentStatus = isRequester ? exchange.host_payment_status : exchange.requester_payment_status
  const otherIdentityStatus = isRequester
    ? exchange.host_identity_verification_status
    : exchange.requester_identity_verification_status

  const handlePayment = async () => {
    // Controleer eerst of identiteit geverifieerd is
    if (userIdentityStatus !== "verified") {
      toast({
        title: "Identiteit niet geverifieerd",
        description: "Je moet eerst je identiteit verifiëren voordat je kunt betalen.",
        variant: "destructive",
      })
      return
    }

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
        throw new Error(errorData.message || errorData.error || "Failed to create payment session")
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          ID-Verificatie & Betaling
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshExchange} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Vernieuwen</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uitleg */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Laatste stappen!</h4>
          <p className="text-blue-800 text-sm">
            <strong>Stap 1:</strong> Verifieer eerst je identiteit via Stripe Identity
            <br />
            <strong>Stap 2:</strong> Betaal daarna de swap fee van €20
            <br />
            Dit zorgt voor veiligheid en vertrouwen in het platform.
          </p>
        </div>

        {/* Stripe Identity uitleg */}
        <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-700 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">Stripe Identity Verificatie</h4>
              <p className="text-purple-800 text-sm">
                Je wordt doorgestuurd naar Stripe's beveiligde omgeving waar je:
                <br />
                1. Een foto van je ID-bewijs (paspoort, rijbewijs of ID-kaart) uploadt
                <br />
                2. Een selfie maakt om te bevestigen dat jij het bent
                <br />
                3. Terugkeert naar SwapBnB zodra de verificatie is voltooid
              </p>
            </div>
          </div>
        </div>

        {/* Jouw status */}
        <div className="space-y-4">
          <h4 className="font-medium">Jouw voortgang</h4>

          {/* Stap 1: ID Verificatie */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  userIdentityStatus === "verified" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">ID-verificatie</span>
            </div>
            {getStatusBadge(userIdentityStatus)}
          </div>

          {/* Stap 2: Betaling */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  userPaymentStatus === "paid"
                    ? "bg-green-500 text-white"
                    : userIdentityStatus === "verified"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Swap fee (€20)</span>
            </div>
            {getStatusBadge(userPaymentStatus)}
          </div>

          {/* ID verificatie knop */}
          {userIdentityStatus === "pending" && (
            <Button onClick={handleIdentityVerification} disabled={isLoading} className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {isLoading ? "Doorsturen naar verificatie..." : "Start ID-verificatie"}
            </Button>
          )}

          {/* Betaling knop - alleen als ID geverifieerd */}
          {userIdentityStatus === "verified" && userPaymentStatus === "pending" && (
            <Button onClick={handlePayment} disabled={isLoading} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? "Doorsturen naar Stripe..." : "Betaal swap fee (€20)"}
            </Button>
          )}

          {/* Beide voltooid */}
          {userPaymentStatus === "paid" && userIdentityStatus === "verified" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Jouw deel is voltooid! Wacht tot de andere partij ook klaar is.
              </p>
            </div>
          )}
        </div>

        {/* Andere partij status */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Status andere partij</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm">ID-verificatie</span>
            {getStatusBadge(otherIdentityStatus)}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Swap fee</span>
            {getStatusBadge(otherPaymentStatus)}
          </div>
        </div>

        {/* Voortgang indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Totale voortgang</span>
            <span className="font-medium">
              {
                [userIdentityStatus, userPaymentStatus, otherIdentityStatus, otherPaymentStatus].filter(
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
                  ([userIdentityStatus, userPaymentStatus, otherIdentityStatus, otherPaymentStatus].filter(
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
                Beide partijen hebben hun identiteit geverifieerd en betaald. De swap is nu officieel bevestigd!
              </p>
            </div>
          )}

        {/* Veiligheid info */}
        <div className="bg-gray-50 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
          <p className="text-gray-700 text-sm">
            <strong>Veilig:</strong> Alle verificaties en betalingen worden verwerkt door Stripe, een van de meest
            vertrouwde betalingsproviders ter wereld.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
