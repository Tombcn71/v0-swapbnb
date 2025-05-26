"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Users } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface HomeContactProps {
  homeId: string
  ownerId: string
  homeTitle: string
}

export function HomeContact({ homeId, ownerId, homeTitle }: HomeContactProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Je moet ingelogd zijn",
        description: "Log in om contact op te nemen met de eigenaar.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Selecteer datums",
        description: "Kies je aankomst- en vertrekdatum.",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Voeg een bericht toe",
        description: "Schrijf een kort bericht aan de eigenaar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: ownerId,
          homeId: homeId,
          content: `Hallo! Ik ben geïnteresseerd in je woning "${homeTitle}".

Aankomst: ${format(checkIn, "d MMMM yyyy", { locale: nl })}
Vertrek: ${format(checkOut, "d MMMM yyyy", { locale: nl })}
Aantal gasten: ${guests}

${message}

Groeten,
${session.user?.name}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Bericht verzonden!",
        description: "Je bericht is succesvol verzonden naar de eigenaar.",
      })

      // Reset form
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geïnteresseerd in deze woning?</CardTitle>
        <p className="text-sm text-muted-foreground">Geïnteresseerd in een huizenruil?</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datum selectie */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aankomst</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "d MMM yyyy", { locale: nl }) : "Selecteer datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Vertrek</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "d MMM yyyy", { locale: nl }) : "Selecteer datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Aantal gasten */}
          <div className="space-y-2">
            <Label htmlFor="guests">Aantal gasten</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="guests"
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number.parseInt(e.target.value) || 1)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Bericht */}
          <div className="space-y-2">
            <Label htmlFor="message">Bericht</Label>
            <Textarea
              id="message"
              placeholder="Vertel iets over jezelf en waarom je geïnteresseerd bent in deze woning..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Swap aanvragen knop */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Je gegevens worden alleen gedeeld met de eigenaar van deze woning.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
