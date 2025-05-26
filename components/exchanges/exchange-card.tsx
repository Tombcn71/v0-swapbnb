"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Calendar, Home, MapPin, MessageSquare, User, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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

interface ExchangeCardProps {
  exchange: any
  currentUserId: string
}

export function ExchangeCard({ exchange, currentUserId }: ExchangeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isRequester = exchange.requester_id === currentUserId
  const isHost = exchange.host_id === currentUserId

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
        description: "Je hebt de swap bevestigd. Zodra beide partijen bevestigen, volgt betaling en verificatie.",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⏳ In afwachting</Badge>
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">✅ Geaccepteerd</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🎉 Bevestigd</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Afgewezen</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">🚫 Geannuleerd</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const renderActions = () => {
    // Stap 1: Pending - wacht op acceptatie door host
    if (exchange.status === "pending") {
      if (isHost) {
        return (
          <div className="flex gap-2">
            <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700" disabled={isLoading} size="sm">
              <CheckCircle className="mr-1 h-4 w-4" />
              Accepteren
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                  <X className="mr-1 h-4 w-4" />
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
          </div>
        )
      } else {
        return <div className="text-sm text-gray-600">Wacht op reactie van {exchange.host_name}...</div>
      }
    }

    // Stap 2: Accepted - beide partijen moeten bevestigen
    if (exchange.status === "accepted") {
      const userConfirmationStatus = isRequester
        ? exchange.requester_confirmation_status
        : exchange.host_confirmation_status
      const otherConfirmationStatus = isRequester
        ? exchange.host_confirmation_status
        : exchange.requester_confirmation_status

      if (userConfirmationStatus === "pending") {
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                <CheckCircle className="mr-1 h-4 w-4" />
                Bevestig Swap
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Swap bevestigen</AlertDialogTitle>
                <AlertDialogDescription>
                  Door te bevestigen ga je akkoord met deze swap. Na wederzijdse bevestiging volgt de betaling en
                  ID-verificatie.
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
        )
      } else {
        return (
          <div className="text-sm">
            <div className="text-green-600 font-medium">✓ Je hebt bevestigd</div>
            {otherConfirmationStatus === "pending" && (
              <div className="text-gray-600">
                Wacht op bevestiging van {isRequester ? exchange.host_name : exchange.requester_name}...
              </div>
            )}
          </div>
        )
      }
    }

    // Stap 3: Confirmed - ga naar betaling
    if (exchange.status === "confirmed") {
      return (
        <div className="space-y-2">
          <div className="text-sm text-green-600 font-medium">🎉 Beide partijen hebben bevestigd!</div>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            Ga naar betaling
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <Card className={exchange.status === "pending" && isHost ? "border-orange-200 bg-orange-50" : ""}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative h-32 w-full md:w-48 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={
                isRequester && exchange.host_home_images?.[0]
                  ? exchange.host_home_images[0]
                  : isHost && exchange.requester_home_images?.[0]
                    ? exchange.requester_home_images[0]
                    : `/placeholder.svg?height=300&width=400&query=${isRequester ? exchange.host_home_title : exchange.requester_home_title}`
              }
              alt={isRequester ? exchange.host_home_title : exchange.requester_home_title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {isRequester
                  ? `Swap met ${exchange.host_home_title}`
                  : `Swap aanvraag voor ${exchange.host_home_title}`}
              </h3>
              {getStatusBadge(exchange.status)}
            </div>

            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{isRequester ? exchange.host_home_city : exchange.requester_home_city}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm">
                  {format(new Date(exchange.start_date), "d MMMM yyyy", { locale: nl })} -{" "}
                  {format(new Date(exchange.end_date), "d MMMM yyyy", { locale: nl })}
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm">
                  {isRequester ? exchange.host_name : exchange.requester_name} • {exchange.guests} gasten
                </span>
              </div>
            </div>

            {exchange.message && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700">{exchange.message}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/messages/${isRequester ? exchange.host_id : exchange.requester_id}`}>
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Bericht
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/homes/${isRequester ? exchange.host_home_id : exchange.requester_home_id}`}>
                    <Home className="mr-1 h-4 w-4" />
                    Bekijk woning
                  </Link>
                </Button>
              </div>

              {renderActions()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
