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
      // Hier zou de Stripe integratie komen
      toast({
        title: "Betaling wordt verwerkt",
        description: "Je wordt doorgestuurd naar de betaalpagina...",
      })

      // Simuleer betaling voor nu
      setTimeout(() => {
        toast({
          title: "Betaling succesvol",
          description: "Je betaling is verwerkt. Wacht op de andere partij.",
        })
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Betaling mislukt",
        description: "Er is iets misgegaan met de betaling. Probeer het opnieuw.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleIdentityVerification = async () => {
    setIsLoading(true)
    try {
      // Hier zou de ID verificatie integratie komen
      toast({
        title: "ID-verificatie wordt gestart",
        description: "Je wordt doorgestuurd naar de verificatiepagina...",
      })

      // Simuleer verificatie voor nu
      setTimeout(() => {
        toast({
          title: "ID-verificatie succesvol",
          description: "Je identiteit is geverifieerd.",
        })
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Verificatie mislukt",
        description: "Er is iets misgegaan met de verificatie. Probeer het opnieuw.",
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

  // Alleen tonen als de exchange geaccepteerd is
  if (exchange.status !== "accepted" && exchange.status !== "confirmed") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Betaling & Verificatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Jouw status */}
        <div className="space-y-4">
          <h4 className="font-medium">Jouw status</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm">Betaling (€50 borg)</span>
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
              {isLoading ? "Verwerken..." : "Betaal borg (€50)"}
            </Button>
          )}

          {/* ID verificatie knop */}
          {userIdentityStatus === "pending" && userPaymentStatus === "paid" && (
            <Button onClick={handleIdentityVerification} disabled={isLoading} variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {isLoading ? "Verifiëren..." : "Verifieer identiteit"}
            </Button>
          )}
        </div>

        {/* Andere partij status */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Status andere partij</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm">Betaling</span>
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
            <span>Voortgang</span>
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

        {/* Informatie */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>Let op:</strong> Beide partijen moeten betalen en hun identiteit verifiëren voordat de swap
            definitief wordt.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
