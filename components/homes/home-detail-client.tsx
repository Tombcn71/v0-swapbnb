"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Users, MapPin, Wifi, Car, Utensils, Tv, Coffee } from "lucide-react"
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

interface HomeDetailClientProps {
  home: any
  userId?: string
  isOwner: boolean
}

export function HomeDetailClient({ home, userId, isOwner }: HomeDetailClientProps) {
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
          recipientId: home.user_id,
          homeId: home.id,
          content: `Hallo! Ik ben geïnteresseerd in je woning "${home.title}".

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

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    kitchen: Utensils,
    tv: Tv,
    coffee: Coffee,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="mb-8">
            {home.images && home.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Image
                    src={home.images[0] || "/placeholder.svg"}
                    alt={home.title}
                    width={800}
                    height={400}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>
                {home.images.slice(1, 5).map((image: string, index: number) => (
                  <Image
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`${home.title} ${index + 2}`}
                    width={400}
                    height={200}
                    className="w-full h-32 md:h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Geen afbeeldingen beschikbaar</p>
              </div>
            )}
          </div>

          {/* Home Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{home.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{home.location}</span>
            </div>
            <p className="text-gray-700 mb-6">{home.description}</p>

            {/* Amenities */}
            {home.amenities && Object.keys(home.amenities).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Voorzieningen</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(home.amenities).map(([key, value]) => {
                    if (!value) return null
                    const IconComponent = amenityIcons[key as keyof typeof amenityIcons]
                    return (
                      <div key={key} className="flex items-center">
                        {IconComponent && <IconComponent className="h-5 w-5 mr-2" />}
                        <span className="capitalize">{key}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="border-t pt-6">
            <div className="flex items-center">
              {home.owner_profile_image ? (
                <Image
                  src={home.owner_profile_image || "/placeholder.svg"}
                  alt={home.owner_name}
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full mr-4"
                />
              ) : (
                <div className="w-15 h-15 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-gray-600 text-lg font-semibold">
                    {home.owner_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">Eigenaar: {home.owner_name}</h3>
                <p className="text-gray-600">Lid sinds {new Date(home.created_at).getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          {!isOwner && (
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
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkIn && "text-muted-foreground",
                            )}
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
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkOut && "text-muted-foreground",
                            )}
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
          )}
        </div>
      </div>
    </div>
  )
}
