"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

interface AddAvailabilityFormProps {
  onAdd: (startDate: Date, endDate: Date) => void
}

export function AddAvailabilityForm({ onAdd }: AddAvailabilityFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const { toast } = useToast()

  const handleAddAvailability = () => {
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

    onAdd(dateRange.from, dateRange.to)
    setDateRange({ from: undefined, to: undefined })
    setIsOpen(false)
  }

  const toggleForm = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setDateRange({ from: undefined, to: undefined })
    }
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          type="button"
          variant="outline"
          onClick={toggleForm}
          className="w-full flex items-center justify-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Beschikbaarheid toevoegen
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-6">
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
                  <PopoverContent className="w-auto p-0" align="start">
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
                <Button type="button" variant="outline" onClick={toggleForm}>
                  Annuleren
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAvailability}
                  className="bg-google-blue hover:bg-blue-600"
                  disabled={!dateRange?.from || !dateRange?.to}
                >
                  Toevoegen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
