"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExchangeActions } from "./exchange-actions"
import { VideocallScheduler } from "./videocall-scheduler"
import { ExchangePayment } from "./exchange-payment"
import { Calendar, MapPin, Users, MessageSquare } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeDetail({ exchange, isRequester }: ExchangeDetailProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ In afwachting</Badge>
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800">✓ Geaccepteerd</Badge>
      case "videocall_scheduled":
        return <Badge className="bg-purple-100 text-purple-800">📹 Videocall gepland</Badge>
      case "videocall_completed":
        return <Badge className="bg-green-100 text-green-800">✓ Videocall voltooid</Badge>
      case "payment_pending":
        return <Badge className="bg-orange-100 text-orange-800">💳 Betaling in behandeling</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">✓ Voltooid</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">✗ Afgewezen</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">✗ Geannuleerd</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1:
        return exchange.status !== "pending" ? "completed" : "current"
      case 2:
        return exchange.status === "accepted" ||
          exchange.status === "videocall_scheduled" ||
          exchange.status === "videocall_completed" ||
          exchange.status === "payment_pending" ||
          exchange.status === "completed"
          ? "completed"
          : exchange.status === "pending"
            ? "pending"
            : "current"
      case 3:
        return exchange.status === "videocall_completed" ||
          exchange.status === "payment_pending" ||
          exchange.status === "completed"
          ? "completed"
          : "pending"
      case 4:
        return exchange.status === "completed" ? "completed" : "pending"
      default:
        return "pending"
    }
  }

  const StepIndicator = ({ step, title, status }: { step: number; title: string; status: string }) => (
    <div className="flex items-center space-x-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          status === "completed"
            ? "bg-green-500 text-white"
            : status === "current"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-600"
        }`}
      >
        {status === "completed" ? "✓" : step}
      </div>
      <span className={`text-sm ${status === "completed" ? "text-green-700" : "text-gray-700"}`}>{title}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Swap Details</h1>
          <p className="text-gray-600 mt-1">
            {isRequester ? "Jouw aanvraag" : "Aanvraag van " + exchange.requester_name}
          </p>
        </div>
        {getStatusBadge(exchange.status)}
      </div>

      {/* Voortgang stappen */}
      <Card>
        <CardHeader>
          <CardTitle>Voortgang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StepIndicator step={1} title="Swap aangevraagd" status={getStepStatus(1)} />
          <StepIndicator step={2} title="Geaccepteerd door gastheer" status={getStepStatus(2)} />
          <StepIndicator step={3} title="Videocall voltooid" status={getStepStatus(3)} />
          <StepIndicator step={4} title="Betaling & ID-verificatie voltooid" status={getStepStatus(4)} />
        </CardContent>
      </Card>

      {/* Videocall Planning - ALTIJD TONEN ALS GEACCEPTEERD */}
      {(exchange.status === "accepted" ||
        exchange.status === "videocall_scheduled" ||
        exchange.status === "videocall_completed") && (
        <VideocallScheduler exchange={exchange} isRequester={isRequester} />
      )}

      {/* Swap details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jouw huis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isRequester ? "Jouw huis" : "Huis van " + exchange.requester_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-medium">{exchange.requester_home_title}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {exchange.requester_home_city}
            </div>
            {exchange.requester_home_images && (
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={
                    typeof exchange.requester_home_images === "string"
                      ? JSON.parse(exchange.requester_home_images)[0]
                      : exchange.requester_home_images[0]
                  }
                  alt={exchange.requester_home_title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gastheer huis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRequester ? "Huis van " + exchange.host_name : "Jouw huis"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-medium">{exchange.host_home_title}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {exchange.host_home_city}
            </div>
            {exchange.host_home_images && (
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={
                    typeof exchange.host_home_images === "string"
                      ? JSON.parse(exchange.host_home_images)[0]
                      : exchange.host_home_images[0]
                  }
                  alt={exchange.host_home_title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Swap informatie */}
      <Card>
        <CardHeader>
          <CardTitle>Swap Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-medium">{formatDate(exchange.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-medium">{formatDate(exchange.end_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Gasten</p>
                <p className="font-medium">{exchange.guests} personen</p>
              </div>
            </div>
          </div>

          {exchange.message && (
            <>
              <Separator />
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">Bericht van {exchange.requester_name}</p>
                </div>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{exchange.message}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Acties */}
      <Card>
        <CardHeader>
          <CardTitle>Acties</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeActions exchange={exchange} isRequester={isRequester} />
        </CardContent>
      </Card>

      {/* Betaling & Verificatie (alleen na videocall) */}
      {exchange.status === "videocall_completed" && <ExchangePayment exchange={exchange} isRequester={isRequester} />}
    </div>
  )
}
