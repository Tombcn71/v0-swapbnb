"use client"

import type React from "react"
import type { DateRange } from "react-day-picker"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { ArrowLeft, Calendar, Home, MapPin, Users } from "lucide-react"

interface SwapRequestFormProps {
  home: any // In een echte applicatie zou dit een Home type zijn
  userHomes: any[] // In een echte applicatie zou dit een Home[] type zijn
  availabilities: any[] // In een echte applicatie zou dit een Availability[] type zijn
}

export function SwapRequestForm({ home, userHomes, availabilities }: SwapRequestFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [message, setMessage] = useState("")
  const [selectedHomeId, setSelectedHomeId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableDates, setAvailableDates] = useState<{ from: Date; to: Date }[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Verwerk de beschikbaarheidsdata
    if (availabilities && availabilities.length > 0) {
      const dates = availabilities.map((avail) => ({
        from: new Date(avail.start_date),
        to: new Date(avail.end_date),
      }))
      setAvailableDates(dates)
    }
  }, [availabilities])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedHomeId) {
      toast({
        title: "Selecteer een woning",
        description: "Selecteer een van je woningen voor de swap",
        variant: "destructive",
      })
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Selecteer data",
        description: "Selecteer de begin- en einddatum voor je verblijf",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Bericht is verplicht",
        description: "Voer een bericht in voor de eigenaar",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostHomeId: home.id,
          requesterHomeId: selectedHomeId,
          startDate: format(dateRange.from, "yyyy-MM-dd"),
          endDate: format(dateRange.to, "yyyy-MM-dd"),
          message: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Er is iets misgegaan bij het aanvragen van de swap")
      }

      toast({
        title: "Swap-verzoek verzonden",
        description: `Je swap-verzoek voor ${home.title} is verzonden naar de eigenaar`,
      })

      // Navigeer naar de uitwisselingspagina
      router.push("/exchanges")
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/homes/${home.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar woningdetails
          </Link>
        </Button>

        <h1 className="text-2xl font-bold mb-6">Swap-verzoek indienen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Selecteer je woning</h2>
              <p className="text-gray-600 mb-4">Kies welke van je woningen je wilt aanbieden voor deze swap.</p>

              {userHomes.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
                  <p className="text-yellow-800">
                    Je hebt nog geen woningen toegevoegd.
                    <Link href="/homes/add" className="text-blue-600 ml-1 underline">
                      Voeg een woning toe
                    </Link>
                  </p>
                </div>
              ) : (
                <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een woning" />
                  </SelectTrigger>
                  <SelectContent>
                    {userHomes.map((userHome) => (
                      <SelectItem key={userHome.id} value={userHome.id}>
                        {userHome.title} - {userHome.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Selecteer data</h2>
              <p className="text-gray-600 mb-4">Selecteer de begin- en einddatum voor je verblijf in {home.city}.</p>
              <DatePickerWithRange
                value={dateRange}
                onChange={(range) => setDateRange(range)}
                availableDates={availableDates}
              />
              {dateRange?.from && dateRange?.to && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-blue-800 text-sm">
                    Je hebt geselecteerd: {format(dateRange.from, "d MMMM yyyy", { locale: nl })} tot{" "}
                    {format(dateRange.to, "d MMMM yyyy", { locale: nl })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Bericht aan de eigenaar</h2>
              <p className="text-gray-600 mb-4">
                Leg uit waarom je geïnteresseerd bent in een huizenswap met {home.owner?.name}.
              </p>
              <Textarea
                placeholder={`Hallo ${home.owner?.name}, ik ben geïnteresseerd in een huizenswap met jouw woning in ${home.city}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Servicekosten</h3>
            <p className="text-blue-700 mb-2">
              Na acceptatie van het swap-verzoek door beide partijen, wordt een servicekost van €25 in rekening
              gebracht.
            </p>
            <p className="text-blue-700 text-sm">
              Deze kosten dekken de administratie, verzekering en ondersteuning tijdens je verblijf.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-google-blue hover:bg-blue-600"
            disabled={isSubmitting || userHomes.length === 0}
          >
            {isSubmitting ? "Aanvraag verzenden..." : "Verzend swap-verzoek"}
          </Button>
        </form>
      </div>

      <div>
        <Card>
          <CardContent className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={
                  Array.isArray(home.images) && home.images.length > 0
                    ? home.images[0]
                    : `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title}`
                }
                alt={home.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{home.title}</h3>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{home.city}</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-gray-600 mr-3" />
                  <span>
                    {home.bedrooms} slaapkamer{home.bedrooms !== 1 && "s"}, {home.bathrooms} badkamer
                    {home.bathrooms !== 1 && "s"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Maximaal {home.max_guests} gasten</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Selecteer beschikbare data</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={
                        home.owner?.image ||
                        `/abstract-geometric-shapes.png?height=40&width=40&query=${home.owner?.name || "/placeholder.svg"}`
                      }
                      alt={home.owner?.name || "Eigenaar"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{home.owner?.name}</p>
                    <p className="text-sm text-gray-600">Eigenaar</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
