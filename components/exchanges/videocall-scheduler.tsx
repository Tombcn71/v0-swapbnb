"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Video, ExternalLink, Phone, Copy, Users } from "lucide-react"

interface VideocallSchedulerProps {
  exchange: any
  onStatusUpdate: () => void
}

export function VideocallScheduler({ exchange, onStatusUpdate }: VideocallSchedulerProps) {
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
      const scheduledDateTime = `${selectedDate}T${selectedTime}:00`

      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_at: scheduledDateTime,
          type: "scheduled",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to schedule videocall")
      }

      toast({
        title: "📹 Google Meet gepland!",
        description: "De videocall is gepland. Beide partijen ontvangen de details.",
      })

      // Reset form
      setSelectedDate("")
      setSelectedTime("")

      onStatusUpdate()
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

  const handleInstantCall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "instant",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start videocall")
      }

      const data = await response.json()

      // Open de videocall
      window.open(data.meetingLink, "_blank")

      toast({
        title: "📹 Google Meet gestart!",
        description: "De andere persoon ontvangt een uitnodiging.",
      })

      onStatusUpdate()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet starten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinCall = () => {
    if (exchange.videocall_link) {
      window.open(exchange.videocall_link, "_blank")
    }
  }

  const handleCompleteCall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall/complete`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete videocall")
      }

      toast({
        title: "✅ Videocall voltooid!",
        description: "Jullie kunnen nu beide de swap bevestigen.",
      })

      onStatusUpdate()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet voltooien.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link gekopieerd",
        description: "De Google Meet link is gekopieerd naar je klembord.",
      })
    } catch (error) {
      toast({
        title: "Kon link niet kopiëren",
        description: "Probeer de link handmatig te selecteren en kopiëren.",
        variant: "destructive",
      })
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
          Kennismaking via Google Meet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>💡 Waarom een videocall?</strong> Maak kennis met elkaar voordat jullie de swap bevestigen. Dit
            bouwt vertrouwen op en jullie kunnen details bespreken.
          </p>
        </div>

        {/* Geplande videocall weergave */}
        {exchange.videocall_scheduled_at && exchange.videocall_link && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-green-800 text-sm mb-2">
              <strong>📹 Geplande Google Meet:</strong>
              <br />
              {formatDateTime(exchange.videocall_scheduled_at)}
            </p>
            <div className="flex gap-2 mb-3">
              <Button onClick={handleJoinCall} className="flex-1" variant="outline">
                <Video className="mr-2 h-4 w-4" />
                Deelnemen aan Google Meet
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => copyLink(exchange.videocall_link!)} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleCompleteCall}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Users className="mr-2 h-4 w-4" />
              {isLoading ? "Voltooien..." : "Videocall Voltooid"}
            </Button>
          </div>
        )}

        {/* Directe videocall optie */}
        {!exchange.videocall_link && (
          <div className="space-y-3">
            <Button onClick={handleInstantCall} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
              <Phone className="mr-2 h-4 w-4" />
              {isLoading ? "Starten..." : "Start Direct Google Meet"}
            </Button>
            <p className="text-xs text-gray-500 text-center">Start direct een Google Meet videocall</p>
          </div>
        )}

        {/* Planning interface */}
        {!exchange.videocall_link && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Of plan een Google Meet</h4>
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
                {isLoading ? "Plannen..." : "Plan Google Meet"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
