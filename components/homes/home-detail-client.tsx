"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, MapPin, Wifi, Car, Utensils, Tv, Coffee } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"

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

  const [availabilities, setAvailabilities] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true)

  // Fetch availabilities
  useEffect(() => {
    async function fetchAvailabilities() {
      try {
        setIsLoadingAvailability(true)
        const response = await fetch(`/api/availabilities?homeId=${home.id}`)
        if (response.ok) {
          const data = await response.json()
          setAvailabilities(data || [])
        }
      } catch (error) {
        console.error("Error fetching availabilities:", error)
      } finally {
        setIsLoadingAvailability(false)
      }
    }

    fetchAvailabilities()
  }, [home.id])

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    return availabilities.some((availability) => {
      const startDate = new Date(availability.start_date || availability.startDate)
      const endDate = new Date(availability.end_date || availability.endDate)
      return date >= startDate && date <= endDate
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Je moet ingelogd zijn",
        description: "Log in om een swap aan te vragen.",
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
      // Eerst haal de huizen van de gebruiker op
      const userHomesResponse = await fetch("/api/homes/user")
      if (!userHomesResponse.ok) {
        throw new Error("Kon je huizen niet ophalen")
      }
      const userHomes = await userHomesResponse.json()

      if (userHomes.length === 0) {
        toast({
          title: "Geen huizen gevonden",
          description: "Je moet eerst een huis toevoegen om te kunnen ruilen.",
          variant: "destructive",
        })
        router.push("/homes/new")
        return
      }

      // Gebruik het eerste huis van de gebruiker
      const userHomeId = userHomes[0].id

      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterHomeId: userHomeId,
          hostHomeId: home.id,
          hostId: home.user_id,
          startDate: format(checkIn, "yyyy-MM-dd"),
          endDate: format(checkOut, "yyyy-MM-dd"),
          guests: guests,
          message: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create exchange")
      }

      const exchange = await response.json()

      toast({
        title: "Swap aanvraag verzonden!",
        description: "Je aanvraag is succesvol verzonden naar de eigenaar.",
      })

      // Redirect naar de exchange pagina
      router.push(`/exchanges/${exchange.id}`)
    } catch (error) {
      console.error("Error creating exchange:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden. Probeer het opnieuw.",
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
              <span>
                {home.address}, {home.city}
              </span>
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

          {/* Availability Calendar */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Beschikbaarheid</h3>
            {isLoadingAvailability ? (
              <div className="flex justify-center p-8">
                <div className="text-gray-500">Beschikbaarheid laden...</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-4">
                <Calendar
                  mode="multiple"
                  selected={[]}
                  numberOfMonths={3}
                  modifiers={{
                    available: (date) => isDateAvailable(date),
                  }}
                  modifiersStyles={{
                    available: {
                      backgroundColor: "#5eead4",
                      color: "#0f766e",
                      fontWeight: "600",
                      borderRadius: "4px",
                    },
                  }}
                  className="rounded-md"
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-teal-300 rounded"></div>
                  <span>Beschikbare periodes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form - ALTIJD TONEN BEHALVE VOOR EIGENAAR */}
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
                      <Label htmlFor="checkin">Aankomst</Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={checkIn ? format(checkIn, "yyyy-MM-dd") : ""}
                        onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : undefined)}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkout">Vertrek</Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={checkOut ? format(checkOut, "yyyy-MM-dd") : ""}
                        onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : undefined)}
                        min={
                          checkIn
                            ? format(new Date(checkIn.getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd")
                            : format(new Date(), "yyyy-MM-dd")
                        }
                        className="w-full"
                      />
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
