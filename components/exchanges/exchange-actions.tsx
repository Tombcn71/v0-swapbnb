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
import { MessageSquare, Ban, CheckCircle, X, CreditCard } from "lucide-react"
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
        description: "Je hebt het swap-verzoek geaccepteerd. Plan nu een videocall om elkaar te leren kennen.",
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

      toast({
        title: "Doorsturen naar betaling",
        description: "Je wordt doorgestuurd naar Stripe voor de betaling...",
      })

      // Voor demo: simuleer redirect
      setTimeout(() => {
        toast({
          title: "Betaling succesvol!",
          description: "Je swap fee van €20 is betaald. Nu kun je je identiteit verifiëren.",
        })
        router.refresh()
      }, 3000)
    } catch (error: any) {
      toast({
        title: "Betaling mislukt",
        description: error.message || "Er is iets misgegaan met de betaling. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stap 1: Pending - wacht op acceptatie door host
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

  // Stap 2: Accepted - plan videocall (wordt getoond in VideocallScheduler component)
  if (exchange.status === "accepted" || exchange.status === "videocall_scheduled") {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            {exchange.status === "accepted"
              ? "✓ Swap geaccepteerd! Plan nu een videocall."
              : "✓ Videocall gepland. Wacht op voltooiing."}
          </p>
        </div>

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
              <AlertDialogDescription>Weet je zeker dat je deze swap wilt annuleren?</AlertDialogDescription>
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

  // Stap 3: Videocall voltooid - ga naar betaling
  if (exchange.status === "videocall_completed") {
    const userPaymentStatus = isRequester ? exchange.requester_payment_status : exchange.host_payment_status

    return (
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">✓ Videocall voltooid! Ga nu door naar betaling en ID-verificatie.</p>
        </div>

        {userPaymentStatus === "pending" && (
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Bezig..." : "Betaal swap fee (€20)"}
          </Button>
        )}

        {userPaymentStatus === "paid" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">✓ Betaling voltooid! Verifieer nu je identiteit.</p>
          </div>
        )}
      </div>
    )
  }

  // Overige statussen
  if (exchange.status === "completed") {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-900 mb-2">🎉 Swap voltooid!</h4>
          <p className="text-green-800 text-sm">Alle stappen zijn voltooid. Jullie kunnen nu genieten van de swap!</p>
        </div>

        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Beoordeling schrijven
        </Button>
      </div>
    )
  }

  return null
}
