"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Video, ExternalLink, Phone, Copy } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface VideocallSchedulerProps {
  exchange: Exchange
  isRequester: boolean
  onMessageSent: () => void
}

export function VideocallScheduler({ exchange, isRequester, onMessageSent }: VideocallSchedulerProps) {
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
        title: "Videocall gepland",
        description: "De videocall is gepland en toegevoegd aan de chat.",
      })

      // Reset form
      setSelectedDate("")
      setSelectedTime("")

      // Refresh messages
      onMessageSent()
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
        title: "Videocall gestart",
        description: "De andere persoon is uitgenodigd via de chat.",
      })

      // Refresh messages
      onMessageSent()
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

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link gekopieerd",
        description: "De videocall link is gekopieerd naar je klembord.",
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
          Videobellen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>💡 Tip:</strong> Videocall uitnodigingen worden automatisch in de chat geplaatst zodat beide
            personen de link kunnen zien.
          </p>
        </div>

        {/* Directe videocall optie */}
        <div className="space-y-3">
          <Button onClick={handleInstantCall} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" />
            {isLoading ? "Uitnodigen..." : "Start Direct Videocall"}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Stuurt direct een uitnodiging via de chat (Jitsi Meet - geen account nodig)
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Of plan een videocall</h4>

          {/* Geplande videocall weergave */}
          {exchange.videocall_scheduled_at && exchange.videocall_link && (
            <div className="bg-green-50 p-3 rounded-md mb-4">
              <p className="text-green-800 text-sm mb-2">
                <strong>Geplande videocall:</strong>
                <br />
                {formatDateTime(exchange.videocall_scheduled_at)}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleJoinCall} className="flex-1" variant="outline">
                  <Video className="mr-2 h-4 w-4" />
                  Deelnemen
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => copyLink(exchange.videocall_link!)} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
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
