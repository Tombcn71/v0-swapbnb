"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

interface AddAvailabilityFormProps {
  homeId?: string
  onAdd?: (startDate: Date, endDate: Date) => void
  onSuccess?: (availability: any) => void
}

export function AddAvailabilityForm({ homeId, onAdd, onSuccess }: AddAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const { toast } = useToast()

  const handleAddAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Selecteer data",
        description: "Selecteer zowel een begin- als einddatum",
        variant: "destructive",
      })
      return
    }

    // Check if dates are in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateRange.from < today) {
      toast({
        title: "Ongeldige begindatum",
        description: "De begindatum kan niet in het verleden liggen",
        variant: "destructive",
      })
      return
    }

    // If onAdd is provided, use it directly (for the add home form)
    if (onAdd) {
      onAdd(dateRange.from, dateRange.to)
      setDateRange({ from: undefined, to: undefined })
      toast({
        title: "Beschikbaarheid toegevoegd",
        description: "De beschikbaarheidsperiode is toegevoegd aan je woning",
      })
      return
    }

    // Otherwise, make an API call (for the home detail page)
    if (!homeId) {
      toast({
        title: "Fout",
        description: "Woning ID ontbreekt. Probeer de pagina te vernieuwen.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Format dates to ISO string
      const startDate = dateRange.from.toISOString()
      const endDate = dateRange.to.toISOString()

      console.log("Sending availability data:", { homeId, startDate, endDate })

      const response = await fetch("/api/availabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeId,
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        throw new Error(errorData.error || "Failed to add availability")
      }

      const responseData = await response.json()
      console.log("API success response:", responseData)

      toast({
        title: "Beschikbaarheid toegevoegd",
        description: "De beschikbaarheidsperiode is succesvol toegevoegd",
      })

      if (onSuccess) {
        onSuccess(responseData)
      }

      setDateRange({ from: undefined, to: undefined })
    } catch (error) {
      console.error("Error adding availability:", error)
      toast({
        title: "Fout bij toevoegen",
        description:
          error instanceof Error ? error.message : "Er is een fout opgetreden bij het toevoegen van de beschikbaarheid",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Selecteer beschikbaarheidsperiode</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "d MMM yyyy", { locale: nl })} -{" "}
                    {format(dateRange.to, "d MMM yyyy", { locale: nl })}
                  </>
                ) : (
                  format(dateRange.from, "d MMMM yyyy", { locale: nl })
                )
              ) : (
                <span>Selecteer een periode</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={nl}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={handleAddAvailability}
          disabled={!dateRange?.from || !dateRange?.to || isSubmitting}
        >
          {isSubmitting ? "Bezig met toevoegen..." : "Toevoegen"}
        </Button>
      </div>
    </div>
  )
}
