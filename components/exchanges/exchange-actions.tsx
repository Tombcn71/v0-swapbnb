"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Ban, CheckCircle, X, CreditCard, Shield } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeActionsProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeActions({ exchange, isRequester }: ExchangeActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept exchange")
      }

      toast({
        title: "Swap-verzoek geaccepteerd",
        description: "Je hebt het swap-verzoek geaccepteerd. Beide partijen moeten nu de swap bevestigen.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon het swap-verzoek niet accepteren. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject exchange")
      }

      toast({
        title: "Swap-verzoek afgewezen",
        description: "Je hebt het swap-verzoek afgewezen.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon het swap-verzoek niet afwijzen. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm exchange")
      }

      toast({
        title: "Swap bevestigd",
        description: "Je hebt de swap bevestigd. Wacht tot de andere partij ook bevestigt.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de swap niet bevestigen. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        throw new Error(errorData.error || "Failed to start payment")
      }

      const data = await response.json()

      toast({
        title: "Betaling wordt verwerkt",
        description: "Je betaling van €50 wordt verwerkt...",
      })

      // Simuleer redirect naar betaalpagina
      setTimeout(() => {
        toast({
          title: "Betaling succesvol",
          description: "Je betaling is verwerkt. Wacht op de andere partij.",
        })
        router.refresh()
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de betaling niet starten. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIdentityVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/identity-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start identity verification")
      }

      const data = await response.json()

      toast({
        title: "ID-verificatie wordt gestart",
        description: "Je wordt doorgestuurd naar de verificatiepagina...",
      })

      // Simuleer redirect naar verificatiepagina
      setTimeout(() => {
        toast({
          title: "ID-verificatie succesvol",
          description: "Je identiteit is geverifieerd.",
        })
        router.refresh()
      }, 3000)
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de ID-verificatie niet starten. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel exchange")
      }

      toast({
        title: "Swap geannuleerd",
        description: "De swap is succesvol geannuleerd.",
      })

      router.push("/exchanges")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de swap niet annuleren. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // STAP 1: Pending - wacht op acceptatie door host
  if (exchange.status === "pending") {
    return (
      <div className="space-y-3">
        {!isRequester ? (
          // Host kan accepteren of afwijzen
          <>
            <Button
              onClick={handleAccept}
              className="w-full justify-start bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accepteren
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Afwijzen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Swap afwijzen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze swap-aanvraag wilt afwijzen? Deze actie kan niet ongedaan worden gemaakt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReject}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "Bezig..." : "Afwijzen"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          // Requester kan alleen annuleren
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Ban className="mr-2 h-4 w-4" />
                Annuleren
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Swap annuleren</AlertDialogTitle>
                <AlertDialogDescription>
                  Weet je zeker dat je deze swap-aanvraag wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Terug</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                  {isLoading ? "Bezig..." : "Annuleren"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )
  }

  // STAP 2: Accepted - beide partijen moeten bevestigen
  if (exchange.status === "accepted") {
    const userConfirmationStatus = isRequester
      ? exchange.requester_confirmation_status
      : exchange.host_confirmation_status
    const otherConfirmationStatus = isRequester
      ? exchange.host_confirmation_status
      : exchange.requester_confirmation_status

    return (
      <div className="space-y-3">
        {userConfirmationStatus === "pending" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Bevestig Swap
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Swap bevestigen</AlertDialogTitle>
                <AlertDialogDescription>
                  Door te bevestigen ga je akkoord met deze swap. Na wederzijdse bevestiging volgt de betaling van €50
                  servicekosten en ID-verificatie.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Terug</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Bezig..." : "Bevestigen"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">✓ Je hebt de swap bevestigd</p>
            {otherConfirmationStatus === "pending" && (
              <p className="text-gray-600 text-sm mt-1">Wacht op bevestiging van de andere partij...</p>
            )}
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Ban className="mr-2 h-4 w-4" />
              Annuleren
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Swap annuleren</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze swap wilt annuleren? Dit kan gevolgen hebben voor je reputatie.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Terug</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                {isLoading ? "Bezig..." : "Annuleren"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // STAP 3: Confirmed - betaling en ID verificatie
  if (exchange.status === "confirmed") {
    const userPaymentStatus = isRequester ? exchange.requester_payment_status : exchange.host_payment_status
    const userIdentityStatus = isRequester
      ? exchange.requester_identity_verification_status
      : exchange.host_identity_verification_status

    return (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">✓ Swap bevestigd door beide partijen</p>
          <p className="text-gray-600 text-sm mt-1">Voltooi nu de betaling en ID-verificatie</p>
        </div>

        {/* Betaling knop */}
        {userPaymentStatus === "pending" && (
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full justify-start bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Verwerken..." : "Betaal €50 servicekosten"}
          </Button>
        )}

        {/* ID verificatie knop */}
        {userPaymentStatus === "paid" && userIdentityStatus === "pending" && (
          <Button
            onClick={handleIdentityVerification}
            disabled={isLoading}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="mr-2 h-4 w-4" />
            {isLoading ? "Verifiëren..." : "Verifieer je identiteit"}
          </Button>
        )}

        {/* Status indicators */}
        {userPaymentStatus === "paid" && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-xs">✓ Betaling voltooid</p>
          </div>
        )}

        {userIdentityStatus === "verified" && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-xs">✓ Identiteit geverifieerd</p>
          </div>
        )}
      </div>
    )
  }

  // Overige statussen
  if (exchange.status === "completed") {
    return (
      <Button variant="outline" className="w-full justify-start">
        <MessageSquare className="mr-2 h-4 w-4" />
        Beoordeling schrijven
      </Button>
    )
  }

  return null
}
