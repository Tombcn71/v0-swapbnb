"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Video, ExternalLink, Phone } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface VideocallSchedulerProps {
  exchange: Exchange
  isRequester: boolean
}

export function VideocallScheduler({ exchange, isRequester }: VideocallSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleScheduleCall = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Vul alle velden in",
        description: "Selecteer een datum en tijd voor de videocall.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Genereer een unieke Jitsi Meet room naam gebaseerd op exchange ID
      const roomName = `swapbnb-${exchange.id.substring(0, 8)}`
      const jitsiLink = `https://meet.jit.si/${roomName}`

      const scheduledDateTime = `${selectedDate}T${selectedTime}:00`

      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_at: scheduledDateTime,
          videocall_link: jitsiLink,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to schedule videocall")
      }

      toast({
        title: "Videocall gepland",
        description: "De videocall is succesvol gepland. Beide partijen ontvangen een notificatie.",
      })

      // Refresh de pagina om de nieuwe status te tonen
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet plannen. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstantCall = () => {
    // Genereer een unieke Jitsi Meet room naam gebaseerd op exchange ID en timestamp
    const roomName = `swapbnb-${exchange.id.substring(0, 8)}-${Date.now()}`
    const jitsiLink = `https://meet.jit.si/${roomName}`

    // Open Jitsi Meet in een nieuw tabblad
    window.open(jitsiLink, "_blank")

    toast({
      title: "Videocall gestart",
      description: "Deel de link met de andere persoon om samen te bellen.",
    })
  }

  const handleJoinCall = () => {
    if (exchange.videocall_link) {
      window.open(exchange.videocall_link, "_blank")
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Videobellen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>Communiceer direct:</strong> Start een videocall om elkaar beter te leren kennen en details te
            bespreken.
          </p>
        </div>

        {/* Directe videocall optie */}
        <div className="space-y-3">
          <Button onClick={handleInstantCall} className="w-full bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" />
            Start Direct Videocall
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Start een directe videocall via Jitsi Meet (geen account nodig)
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Of plan een videocall</h4>

          {/* Geplande videocall weergave */}
          {exchange.videocall_scheduled_at && (
            <div className="bg-green-50 p-3 rounded-md mb-4">
              <p className="text-green-800 text-sm">
                <strong>Geplande videocall:</strong>
                <br />
                {formatDateTime(exchange.videocall_scheduled_at)}
              </p>
              {exchange.videocall_link && (
                <Button onClick={handleJoinCall} className="mt-2 w-full" variant="outline">
                  <Video className="mr-2 h-4 w-4" />
                  Deelnemen aan geplande call
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Planning interface */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label htmlFor="time">Tijd</Label>
              <Input id="time" type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            </div>

            <Button onClick={handleScheduleCall} disabled={isLoading} variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              {isLoading ? "Plannen..." : "Plan Videocall"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
