"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Calendar, Home, MapPin, MessageSquare, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange } from "@/lib/types"

interface ExchangeListProps {
  type: "incoming" | "outgoing" | "upcoming" | "past"
}

export function ExchangeList({ type }: ExchangeListProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchExchanges = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/exchanges?type=${type}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch exchanges")
        }

        const data = await response.json()
        setExchanges(data)
      } catch (error: any) {
        console.error("Error fetching exchanges:", error)
        toast({
          title: "Er is iets misgegaan",
          description: error.message || "Kon de swaps niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchanges()
  }, [type, toast])

  const handleAccept = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}`, {
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

      const updatedExchange = await response.json()

      // Update local state
      setExchanges((prev) => prev.map((ex) => (ex.id === exchangeId ? updatedExchange : ex)))

      toast({
        title: "Aanvraag geaccepteerd",
        description: "De swap-aanvraag is succesvol geaccepteerd.",
      })
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de aanvraag niet accepteren. Probeer het later opnieuw.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}`, {
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

      const updatedExchange = await response.json()

      // Update local state
      setExchanges((prev) => prev.map((ex) => (ex.id === exchangeId ? updatedExchange : ex)))

      toast({
        title: "Aanvraag afgewezen",
        description: "De swap-aanvraag is afgewezen.",
      })
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de aanvraag niet afwijzen. Probeer het later opnieuw.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}`, {
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

      const updatedExchange = await response.json()

      // Update local state
      setExchanges((prev) => prev.map((ex) => (ex.id === exchangeId ? updatedExchange : ex)))

      toast({
        title: "Aanvraag geannuleerd",
        description: "De swap-aanvraag is geannuleerd.",
      })
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de aanvraag niet annuleren. Probeer het later opnieuw.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-end space-x-2">
                <div className="h-9 bg-gray-200 rounded w-24"></div>
                <div className="h-9 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (exchanges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            {type === "incoming"
              ? "Je hebt nog geen inkomende swap-aanvragen."
              : type === "outgoing"
                ? "Je hebt nog geen uitgaande swap-aanvragen."
                : type === "upcoming"
                  ? "Je hebt nog geen aankomende swaps."
                  : "Je hebt nog geen eerdere swaps."}
          </p>
          {(type === "outgoing" || type === "upcoming") && (
            <Button asChild>
              <Link href="/listings">Zoek woningen</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {exchanges.map((exchange) => (
        <Card key={exchange.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative h-32 w-full md:w-48 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={`/abstract-geometric-shapes.png?height=300&width=400&query=${exchange.homeTitle}`}
                  alt={exchange.homeTitle}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{exchange.homeTitle}</h3>
                  <Badge
                    className={`mt-1 md:mt-0 w-fit ${
                      exchange.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : exchange.status === "accepted"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : exchange.status === "rejected" || exchange.status === "canceled"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }`}
                  >
                    {exchange.status === "pending"
                      ? "In afwachting"
                      : exchange.status === "accepted"
                        ? "Geaccepteerd"
                        : exchange.status === "rejected"
                          ? "Afgewezen"
                          : exchange.status === "canceled"
                            ? "Geannuleerd"
                            : "Voltooid"}
                  </Badge>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{exchange.homeCity}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">
                      {format(new Date(exchange.startDate), "d MMMM yyyy", { locale: nl })} -{" "}
                      {format(new Date(exchange.endDate), "d MMMM yyyy", { locale: nl })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">
                      {type === "incoming" ? exchange.requesterName : exchange.homeOwnerName}
                    </span>
                  </div>
                </div>

                {exchange.message && (
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-700">{exchange.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end">
                  {type === "incoming" && exchange.status === "pending" && (
                    <>
                      <Button variant="outline" onClick={() => handleReject(exchange.id)}>
                        Afwijzen
                      </Button>
                      <Button onClick={() => handleAccept(exchange.id)}>Accepteren</Button>
                    </>
                  )}

                  {type === "outgoing" && exchange.status === "pending" && (
                    <Button variant="outline" onClick={() => handleCancel(exchange.id)}>
                      Annuleren
                    </Button>
                  )}

                  <Button variant="outline" asChild>
                    <Link href={`/messages/${type === "incoming" ? exchange.requesterId : exchange.ownerId}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Bericht
                    </Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link href={`/homes/${exchange.homeId}`}>
                      <Home className="mr-2 h-4 w-4" />
                      Bekijk woning
                    </Link>
                  </Button>

                  {(exchange.status === "accepted" || exchange.status === "completed") && (
                    <Button asChild>
                      <Link href={`/exchanges/${exchange.id}`}>Details</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
