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
        title: "Uitwisseling geannuleerd",
        description: "De uitwisseling is succesvol geannuleerd.",
      })

      router.push("/exchanges")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de uitwisseling niet annuleren. Probeer het later opnieuw.",
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
        title: "Uitwisseling voltooid",
        description: "De uitwisseling is gemarkeerd als voltooid.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de uitwisseling niet voltooien. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {exchange.status === "pending" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Ban className="mr-2 h-4 w-4" />
              Annuleren
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Uitwisseling annuleren</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze uitwisselingsaanvraag wilt annuleren? Deze actie kan niet ongedaan worden
                gemaakt.
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
                  Als je een probleem hebt met deze uitwisseling, neem dan direct contact op met de andere partij. Als
                  jullie er samen niet uitkomen, kun je contact opnemen met onze klantenservice.
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
                <AlertDialogTitle>Uitwisseling annuleren</AlertDialogTitle>
                <AlertDialogDescription>
                  Weet je zeker dat je deze uitwisseling wilt annuleren? Dit kan gevolgen hebben voor je reputatie op
                  het platform.
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
                  <AlertDialogTitle>Uitwisseling voltooien</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze uitwisseling wilt markeren als voltooid? Je kunt daarna een beoordeling
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

      {exchange.status === "completed" && (
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Beoordeling schrijven
        </Button>
      )}
    </div>
  )
}
