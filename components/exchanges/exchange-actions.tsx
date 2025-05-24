"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
import { CheckCircle, XCircle, Clock } from "lucide-react"
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
        title: "Swap geaccepteerd",
        description: "De swap is geaccepteerd. Beide partijen kunnen nu betalen.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Fout bij accepteren",
        description: error.message || "Er is een fout opgetreden bij het accepteren van de swap.",
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
        title: "Swap afgewezen",
        description: "De swap is afgewezen.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Fout bij afwijzen",
        description: error.message || "Er is een fout opgetreden bij het afwijzen van de swap.",
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
        description: "De swap is geannuleerd.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Fout bij annuleren",
        description: error.message || "Er is een fout opgetreden bij het annuleren van de swap.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Bepaal welke acties beschikbaar zijn
  const canAccept = !isRequester && exchange.status === "pending"
  const canReject = !isRequester && exchange.status === "pending"
  const canCancel = isRequester && exchange.status === "pending"

  if (exchange.status === "confirmed" || exchange.status === "completed") {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 border border-green-100 rounded-md">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-green-700">Swap bevestigd</span>
      </div>
    )
  }

  if (exchange.status === "rejected" || exchange.status === "cancelled") {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-100 rounded-md">
        <XCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">{exchange.status === "rejected" ? "Swap afgewezen" : "Swap geannuleerd"}</span>
      </div>
    )
  }

  if (exchange.status === "accepted") {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-md">
        <Clock className="h-5 w-5 text-blue-500 mr-2" />
        <span className="text-blue-700">Wachten op betalingen</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {canAccept && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={isLoading}>
              Accepteer swap
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Swap accepteren</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze swap wilt accepteren? Na acceptatie kunnen beide partijen betalen om de swap
                te bevestigen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction onClick={handleAccept}>Accepteren</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canReject && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Afwijzen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Swap afwijzen</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze swap wilt afwijzen? Deze actie kan niet ongedaan worden gemaakt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject}>Afwijzen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Annuleren
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Swap annuleren</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze swap wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Terug</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>Annuleren</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
