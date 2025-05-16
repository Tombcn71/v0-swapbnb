"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AddAvailabilityForm } from "./add-availability-form"
import { PlusIcon, TrashIcon } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { nl } from "date-fns/locale"

interface Availability {
  id: string
  home_id?: string
  homeId?: string
  start_date?: string
  startDate?: string
  end_date?: string
  endDate?: string
  status?: string
}

interface HomeAvailabilityProps {
  homeId: string
  isOwner: boolean
}

export function HomeAvailability({ homeId, isOwner }: HomeAvailabilityProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Log for debugging
  useEffect(() => {
    console.log("HomeAvailability - received homeId:", homeId)

    if (!homeId) {
      console.error("HomeAvailability - No homeId provided")
      setError("Woning ID ontbreekt. Probeer de pagina te vernieuwen.")
      setIsLoading(false)
    }
  }, [homeId])

  useEffect(() => {
    async function fetchAvailabilities() {
      if (!homeId) {
        console.error("HomeAvailability - No homeId provided for fetching")
        setError("Woning ID ontbreekt. Probeer de pagina te vernieuwen.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log(`Fetching availabilities for homeId: ${homeId}`)
        const response = await fetch(`/api/availabilities?homeId=${homeId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch availabilities")
        }

        const data = await response.json()
        console.log("Fetched availabilities:", data)

        setAvailabilities(data || [])
      } catch (err) {
        console.error("Error fetching availabilities:", err)
        setError("Error loading availabilities. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (homeId) {
      fetchAvailabilities()
    }
  }, [homeId])

  const handleAddAvailability = (newAvailability: Availability) => {
    console.log("Adding new availability:", newAvailability)
    setAvailabilities((prev) => [...prev, newAvailability])
    setShowAddForm(false)
    router.refresh()
  }

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze beschikbaarheidsperiode wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/availabilities/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete availability")
      }

      setAvailabilities(availabilities.filter((avail) => avail.id !== id))
      toast({
        title: "Beschikbaarheid verwijderd",
        description: "De beschikbaarheidsperiode is succesvol verwijderd",
      })
      router.refresh()
    } catch (err) {
      console.error("Error deleting availability:", err)
      toast({
        title: "Fout bij verwijderen",
        description:
          err instanceof Error ? err.message : "Er is een fout opgetreden bij het verwijderen van de beschikbaarheid",
        variant: "destructive",
      })
    }
  }

  // Function to safely parse a date string
  const parseDate = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date()
    try {
      return new Date(dateStr)
    } catch (e) {
      console.error("Error parsing date:", dateStr, e)
      return new Date()
    }
  }

  // Function to determine if a date is within any availability period
  const isDateAvailable = (date: Date) => {
    return availabilities.some((availability) => {
      const startDate = parseDate(availability.start_date || availability.startDate)
      const endDate = parseDate(availability.end_date || availability.endDate)
      return date >= startDate && date <= endDate
    })
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Beschikbaarheid laden...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Fout: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (!homeId) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Fout: </strong>
        <span className="block sm:inline">Woning ID ontbreekt. Probeer de pagina te vernieuwen.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Beschikbaarheidskalender</h2>
        {isOwner && (
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            {showAddForm ? "Annuleren" : "Beschikbaarheid toevoegen"}
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <AddAvailabilityForm homeId={homeId} onSuccess={handleAddAvailability} />
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <Calendar
          mode="multiple"
          selected={[]}
          modifiers={{
            available: (date) => isDateAvailable(date),
          }}
          modifiersStyles={{
            available: { backgroundColor: "#dcfce7", color: "#166534" },
          }}
          className="rounded-md border"
        />
        <p className="mt-2 text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-100 mr-2 rounded-sm"></span>
          Beschikbare data
        </p>
      </div>

      {availabilities.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Beschikbare periodes</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {availabilities.map((availability) => (
              <Card key={availability.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {format(parseDate(availability.start_date || availability.startDate), "PPP", {
                          locale: nl,
                        })}{" "}
                        - {format(parseDate(availability.end_date || availability.endDate), "PPP", { locale: nl })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.ceil(
                          (parseDate(availability.end_date || availability.endDate).getTime() -
                            parseDate(availability.start_date || availability.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        dagen
                      </p>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAvailability(availability.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Geen beschikbaarheidsperiodes ingesteld voor deze woning.</p>
          {isOwner && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4">
              Beschikbaarheid toevoegen
            </Button>
          )}
        </div>
      )}

      {!isOwner && availabilities.length > 0 && (
        <div className="mt-6">
          <Link href={`/homes/${homeId}/exchange`}>
            <Button className="w-full">Uitwisseling aanvragen</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
