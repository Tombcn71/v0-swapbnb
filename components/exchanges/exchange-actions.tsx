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
import { Calendar, MessageSquare, AlertTriangle, Ban, CheckCircle } from "lucide-react"
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
        description: "Je hebt het swap-verzoek geaccepteerd. Betaal nu de servicekosten om de swap te bevestigen.",
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

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "canceled" }),
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

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete exchange")
      }

      toast({
        title: "Swap voltooid",
        description: "De swap is gemarkeerd als voltooid.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de swap niet voltooien. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "confirmed" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm exchange")
      }

      toast({
        title: "Swap bevestigd",
        description: "De swap is bevestigd en kan nu plaatsvinden.",
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

  return (
    <div className="space-y-3">
      {exchange.status === "pending" && (
        <>
          {!isRequester && (
            <Button
              onClick={handleAccept}
              className="w-full justify-start bg-google-blue hover:bg-blue-600"
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accepteren
            </Button>
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
                  Weet je zeker dat je deze swap-aanvraag wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="bg-google-blue hover:bg-blue-600"
                >
                  {isLoading ? "Bezig..." : "Bevestigen"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {exchange.status === "accepted" && (
        <>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Toevoegen aan agenda
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Probleem melden
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Probleem melden</AlertDialogTitle>
                <AlertDialogDescription>
                  Als je een probleem hebt met deze swap, neem dan direct contact op met de andere partij. Als jullie er
                  samen niet uitkomen, kun je contact opnemen met onze klantenservice.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Sluiten</AlertDialogCancel>
                <AlertDialogAction className="bg-google-blue hover:bg-blue-600">Contact opnemen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                  Weet je zeker dat je deze swap wilt annuleren? Dit kan gevolgen hebben voor je reputatie op het
                  platform.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Terug</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="bg-google-blue hover:bg-blue-600"
                >
                  {isLoading ? "Bezig..." : "Bevestigen"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {new Date(exchange.endDate) <= new Date() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full justify-start bg-google-blue hover:bg-blue-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Markeer als voltooid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Swap voltooien</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze swap wilt markeren als voltooid? Je kunt daarna een beoordeling
                    achterlaten.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-google-blue hover:bg-blue-600"
                  >
                    {isLoading ? "Bezig..." : "Bevestigen"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}

      {exchange.status === "accepted" &&
        exchange.requester_payment_status === "paid" &&
        exchange.host_payment_status === "paid" && (
          <Button
            onClick={handleConfirm}
            className="w-full justify-start bg-google-blue hover:bg-blue-600"
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Bevestig Swap
          </Button>
        )}

      {exchange.status === "completed" && (
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Beoordeling schrijven
        </Button>
      )}
    </div>
  )
}
