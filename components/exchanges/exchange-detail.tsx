"use client"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExchangeActions } from "./exchange-actions"
import { ExchangePayment } from "./exchange-payment"
import { MessageList } from "@/components/messaging/message-list"
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailProps {
  exchange: Exchange & {
    requester_home_title: string
    requester_home_city: string
    requester_home_images: string
    host_home_title: string
    host_home_city: string
    host_home_images: string
    requester_name: string
    requester_email: string
    host_name: string
    host_email: string
  }
  isRequester: boolean
}

export function ExchangeDetail({ exchange, isRequester }: ExchangeDetailProps) {
  // Parse images
  const requesterHomeImages = Array.isArray(exchange.requester_home_images)
    ? exchange.requester_home_images
    : typeof exchange.requester_home_images === "string"
      ? JSON.parse(exchange.requester_home_images)
      : []

  const hostHomeImages = Array.isArray(exchange.host_home_images)
    ? exchange.host_home_images
    : typeof exchange.host_home_images === "string"
      ? JSON.parse(exchange.host_home_images)
      : []

  // Bepaal de andere partij op basis van de rol
  const otherPartyName = isRequester ? exchange.host_name : exchange.requester_name
  const otherPartyId = isRequester ? exchange.host_id : exchange.requester_id

  // Status badge kleur
  const getStatusColor = () => {
    switch (exchange.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Status vertaling
  const getStatusText = () => {
    switch (exchange.status) {
      case "pending":
        return "In afwachting"
      case "accepted":
        return "Geaccepteerd"
      case "confirmed":
        return "Bevestigd"
      case "completed":
        return "Voltooid"
      case "canceled":
        return "Geannuleerd"
      default:
        return exchange.status
    }
  }

  return (
    <div>
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/exchanges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar swaps
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Swap: {exchange.requester_home_city} ↔ {exchange.host_home_city}
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
            <span className="text-gray-500">
              Aangevraagd op {format(new Date(exchange.created_at), "d MMMM yyyy", { locale: nl })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="messages">Berichten</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jouw woning */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{isRequester ? "Jouw woning" : "Aanvrager's woning"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            requesterHomeImages[0] ||
                            `/abstract-geometric-shapes.png?height=400&width=600&query=${exchange.requester_home_title || "/placeholder.svg"}`
                          }
                          alt={exchange.requester_home_title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{exchange.requester_home_title}</h3>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{exchange.requester_home_city}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/homes/${exchange.requester_home_id}`}>Bekijk woning</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Andere woning */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{isRequester ? "Gastheer's woning" : "Jouw woning"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            hostHomeImages[0] ||
                            `/abstract-geometric-shapes.png?height=400&width=600&query=${exchange.host_home_title || "/placeholder.svg"}`
                          }
                          alt={exchange.host_home_title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{exchange.host_home_title}</h3>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{exchange.host_home_city}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/homes/${exchange.host_home_id}`}>Bekijk woning</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Swap-details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Swap-periode</p>
                          <p>
                            {format(new Date(exchange.start_date), "d MMMM yyyy", { locale: nl })} tot{" "}
                            {format(new Date(exchange.end_date), "d MMMM yyyy", { locale: nl })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{isRequester ? "Gastheer" : "Aanvrager"}</p>
                          <p>{isRequester ? exchange.host_name : exchange.requester_name}</p>
                        </div>
                      </div>

                      {exchange.message && (
                        <div className="border-t pt-4 mt-4">
                          <p className="font-medium mb-2">Bericht van aanvrager</p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-700">{exchange.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="h-[600px]">
                <MessageList recipientId={otherPartyId} recipientName={otherPartyName} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Acties */}
          <Card>
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent>
              <ExchangeActions exchange={exchange} isRequester={isRequester} />
            </CardContent>
          </Card>

          {/* Betaling (alleen tonen als status accepted is) */}
          {exchange.status === "accepted" && <ExchangePayment exchange={exchange} isRequester={isRequester} />}

          {/* Status informatie */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Aanvraag</span>
                  <Badge className="bg-green-100 text-green-800">Voltooid</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Acceptatie</span>
                  <Badge
                    className={
                      exchange.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }
                  >
                    {exchange.status === "pending" ? "In afwachting" : "Voltooid"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Betaling aanvrager</span>
                  <Badge
                    className={
                      exchange.requester_payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {exchange.requester_payment_status === "paid" ? "Betaald" : "Niet betaald"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Betaling gastheer</span>
                  <Badge
                    className={
                      exchange.host_payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {exchange.host_payment_status === "paid" ? "Betaald" : "Niet betaald"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Bevestiging</span>
                  <Badge
                    className={
                      exchange.status === "confirmed" || exchange.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {exchange.status === "confirmed" || exchange.status === "completed"
                      ? "Bevestigd"
                      : "Niet bevestigd"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
