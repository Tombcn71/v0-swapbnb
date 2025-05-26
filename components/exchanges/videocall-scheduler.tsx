"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Video, ExternalLink } from "lucide-react"
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
      const scheduledDateTime = `${selectedDate}T${selectedTime}:00`

      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_at: scheduledDateTime,
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
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete videocall")
      }

      toast({
        title: "Videocall voltooid",
        description: "Ga nu door naar de betaling en ID-verificatie.",
      })

      // Refresh de pagina om de nieuwe status te tonen
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet voltooien. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  // Alleen tonen als exchange geaccepteerd is
  if (
    exchange.status !== "accepted" &&
    exchange.status !== "videocall_scheduled" &&
    exchange.status !== "videocall_completed"
  ) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Videocall Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exchange.status === "accepted" && (
          <>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Volgende stap:</strong> Plan een videocall om elkaar te leren kennen en de swap details te
                bespreken.
              </p>
            </div>

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

              <Button onClick={handleScheduleCall} disabled={isLoading} className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                {isLoading ? "Plannen..." : "Plan Videocall"}
              </Button>
            </div>
          </>
        )}

        {exchange.status === "videocall_scheduled" && exchange.videocall_scheduled_at && (
          <>
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-green-800 text-sm">
                <strong>Videocall gepland voor:</strong>
                <br />
                {formatDateTime(exchange.videocall_scheduled_at)}
              </p>
            </div>

            {exchange.videocall_link && (
              <div className="space-y-3">
                <Button onClick={handleJoinCall} className="w-full bg-green-600 hover:bg-green-700">
                  <Video className="mr-2 h-4 w-4" />
                  Deelnemen aan videocall
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <Button onClick={handleCompleteCall} disabled={isLoading} variant="outline" className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  {isLoading ? "Voltooien..." : "Videocall voltooid"}
                </Button>
              </div>
            )}
          </>
        )}

        {exchange.status === "videocall_completed" && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>✓ Videocall voltooid!</strong>
              <br />
              Ga nu door naar de betaling en ID-verificatie.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
