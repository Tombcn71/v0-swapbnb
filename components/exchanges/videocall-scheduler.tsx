"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Video, Loader2, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exchange } from "@/lib/types"

interface VideocallSchedulerProps {
  exchange: Exchange
  onStatusUpdate: () => void
}

export function VideocallScheduler({ exchange, onStatusUpdate }: VideocallSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("14:00")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("whereby")
  const { toast } = useToast()

  const handleScheduleCall = async () => {
    if (!date) {
      toast({
        title: "❌ Selecteer een datum",
        description: "Kies een datum voor de videocall.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format the date and time
      const callDate = new Date(date)
      const [hours, minutes] = time.split(":").map(Number)
      callDate.setHours(hours, minutes)

      let callUrl = ""
      let callProvider = ""

      if (activeTab === "whereby") {
        // Generate a Whereby room URL
        const roomName = `swapbnb-${exchange.id}-${Date.now()}`
        callUrl = `https://whereby.com/${roomName}`
        callProvider = "Whereby"
      } else if (activeTab === "whatsapp") {
        // For WhatsApp, we'll just suggest exchanging numbers
        callUrl = "whatsapp://send?text=Hallo! Laten we een videocall plannen voor onze huizenruil."
        callProvider = "WhatsApp"
      }

      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_date: callDate.toISOString(),
          call_url: callUrl,
          call_provider: callProvider,
        }),
      })

      if (response.ok) {
        toast({
          title: "✅ Videocall gepland!",
          description: `Je videocall is gepland voor ${format(callDate, "d MMMM 'om' HH:mm", { locale: nl })}.`,
        })
        onStatusUpdate()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to schedule videocall")
      }
    } catch (error: any) {
      console.error("Error scheduling videocall:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het plannen van de videocall.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeOptions = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ]

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Plan een videocall</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Plan een videocall om elkaar te leren kennen en vragen te stellen over elkaars woning.
        </p>

        <Tabs defaultValue="whereby" onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="whereby">
              <Video className="w-4 h-4 mr-2" />
              Whereby (aanbevolen)
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
          </TabsList>
          <TabsContent value="whereby" className="pt-2">
            <p className="text-sm text-gray-600 mb-2">
              Whereby werkt direct in je browser zonder installatie. HD kwaliteit en betrouwbare verbinding.
            </p>
          </TabsContent>
          <TabsContent value="whatsapp" className="pt-2">
            <p className="text-sm text-gray-600 mb-2">
              Gebruik WhatsApp als je dat liever hebt. Je kunt telefoonnummers uitwisselen via de chat.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: nl }) : <span>Kies een datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tijd</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleScheduleCall}
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={isSubmitting || !date}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
          Plan Videocall
        </Button>
      </CardContent>
    </Card>
  )
}
