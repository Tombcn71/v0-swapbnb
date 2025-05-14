"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { nl } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface HomeAvailabilityProps {
  homeId: string
}

export function HomeAvailability({ homeId }: HomeAvailabilityProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [availabilities, setAvailabilities] = useState<{ start: Date; end: Date }[]>([])
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

        // Convert string dates to Date objects
        const formattedAvailabilities = data.map((availability: any) => ({
          start: new Date(availability.start_date),
          end: new Date(availability.end_date),
        }))

        setAvailabilities(formattedAvailabilities)
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
    return availabilities.some((range) => date >= range.start && date <= range.end)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full"></div>
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
          numberOfMonths={2}
        />
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Deze woning is beschikbaar op de gemarkeerde data. Neem contact op met de eigenaar om een huizenruil te
        bespreken.
      </p>
    </div>
  )
}
