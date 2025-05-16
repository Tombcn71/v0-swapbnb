"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { nl } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addMonths } from "date-fns"

interface HomeAvailabilityProps {
  homeId: string
}

interface Availability {
  id: string
  home_id: string
  start_date: string
  end_date: string
  status: string
}

export function HomeAvailability({ homeId }: HomeAvailabilityProps) {
  // Start met de huidige maand
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAvailabilities = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/availabilities?homeId=${homeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch availabilities")
        }

        const data = await response.json()
        console.log("Fetched availabilities:", data) // Debug log
        setAvailabilities(data)

        // Als er beschikbaarheden zijn, stel de kalender in op de maand van de eerste beschikbaarheid
        if (data.length > 0) {
          const firstAvailabilityDate = new Date(data[0].start_date)
          setSelectedMonth(firstAvailabilityDate)
        }
      } catch (error) {
        console.error("Error fetching availabilities:", error)
        toast({
          title: "Er is iets misgegaan",
          description: "Kon de beschikbaarheden niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailabilities()
  }, [homeId, toast])

  // Functie om te controleren of een datum beschikbaar is
  const isDateAvailable = (date: Date) => {
    return availabilities.some((availability) => {
      const startDate = new Date(availability.start_date)
      const endDate = new Date(availability.end_date)

      // Reset de tijd naar middernacht voor een eerlijke vergelijking
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      return compareDate >= startDate && compareDate <= endDate && availability.status === "available"
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
      </div>
    )
  }

  // Als er geen beschikbaarheden zijn, toon een bericht
  if (availabilities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Er zijn geen beschikbaarheden voor deze woning.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Badge variant="outline" className="mr-2 bg-green-50">
          Beschikbaar
        </Badge>
        <Badge variant="outline" className="bg-gray-100">
          Niet beschikbaar
        </Badge>
      </div>
      <div className="border rounded-lg p-4">
        <Calendar
          mode="single"
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          className="rounded-md"
          locale={nl}
          modifiers={{
            available: (date) => isDateAvailable(date),
          }}
          modifiersStyles={{
            available: { backgroundColor: "#dcfce7" },
          }}
          disabled={(date) => !isDateAvailable(date)}
          numberOfMonths={1}
          fromMonth={new Date()} // Sta niet toe om naar het verleden te navigeren
          toMonth={addMonths(new Date(), 24)} // Sta toe om tot 2 jaar in de toekomst te navigeren
        />
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Deze woning is beschikbaar op de gemarkeerde data. Neem contact op met de eigenaar om een huizenruil te
        bespreken.
      </p>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Beschikbare periodes:</h3>
        <div className="space-y-2">
          {availabilities.map((availability) => (
            <div key={availability.id} className="p-3 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {new Date(availability.start_date).toLocaleDateString("nl-NL")} tot{" "}
                    {new Date(availability.end_date).toLocaleDateString("nl-NL")}
                  </span>
                </div>
                <Badge variant={availability.status === "available" ? "outline" : "secondary"} className="bg-green-50">
                  {availability.status === "available" ? "Beschikbaar" : "Niet beschikbaar"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
