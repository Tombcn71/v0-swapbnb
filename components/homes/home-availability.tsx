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

interface Availability {
  id: string
  startDate: Date
  endDate: Date
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

  useEffect(() => {
    async function fetchAvailabilities() {
      try {
        const response = await fetch(`/api/availabilities?homeId=${homeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch availabilities")
        }
        const data = await response.json()

        // Convert string dates to Date objects
        const formattedAvailabilities = data.map((avail: any) => ({
          ...avail,
          startDate: new Date(avail.startDate),
          endDate: new Date(avail.endDate),
        }))

        setAvailabilities(formattedAvailabilities)
      } catch (err) {
        setError("Error loading availabilities. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailabilities()
  }, [homeId])

  const handleAddAvailability = (newAvailability: Availability) => {
    setAvailabilities([...availabilities, newAvailability])
    setShowAddForm(false)
  }

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability period?")) {
      return
    }

    try {
      const response = await fetch(`/api/availabilities/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete availability")
      }

      setAvailabilities(availabilities.filter((avail) => avail.id !== id))
      router.refresh()
    } catch (err) {
      console.error("Error deleting availability:", err)
      setError("Failed to delete availability. Please try again.")
    }
  }

  // Function to determine if a date is within any availability period
  const isDateAvailable = (date: Date) => {
    return availabilities.some(
      (availability) => date >= new Date(availability.startDate) && date <= new Date(availability.endDate),
    )
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading availability...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Availability Calendar</h2>
        {isOwner && (
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            {showAddForm ? "Cancel" : "Add Availability"}
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
          Available dates
        </p>
      </div>

      {availabilities.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Available Periods</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {availabilities.map((availability) => (
              <Card key={availability.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {format(new Date(availability.startDate), "PPP")} -{" "}
                        {format(new Date(availability.endDate), "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.ceil(
                          (new Date(availability.endDate).getTime() - new Date(availability.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
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
          <p className="text-gray-500">No availability periods set for this property.</p>
          {isOwner && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4">
              Add Availability
            </Button>
          )}
        </div>
      )}

      {!isOwner && availabilities.length > 0 && (
        <div className="mt-6">
          <Link href={`/homes/${homeId}/exchange`}>
            <Button className="w-full">Request Exchange</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
