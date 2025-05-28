"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface DatePickerWithRangeProps {
  dateRange: DateRange | undefined
  setDateRange: (dateRange: DateRange | undefined) => void
  availableDateRanges: { from: Date; to: Date }[]
}

function DatePickerWithRange({ dateRange, setDateRange, availableDateRanges }: DatePickerWithRangeProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            {dateRange?.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`
              ) : (
                format(dateRange.from, "LLL dd, yyyy")
              )
            ) : (
              <span>Kies een datum</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            disabled={
              availableDateRanges.length > 0
                ? (date) => {
                    return !availableDateRanges.some((range) => {
                      return date >= range.from && date <= range.to
                    })
                  }
                : undefined
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface SwapRequestFormProps {
  selectedHome: any
  onSubmit: (data: any) => void
}

export function SwapRequestForm({ selectedHome, onSubmit }: SwapRequestFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(false)

  // Fetch availabilities for the selected home
  useEffect(() => {
    async function fetchAvailabilities() {
      if (!selectedHome?.id) return

      setIsLoadingAvailabilities(true)
      try {
        const response = await fetch(`/api/availabilities?homeId=${selectedHome.id}`)
        if (response.ok) {
          const data = await response.json()
          setAvailabilities(data || [])
        }
      } catch (error) {
        console.error("Error fetching availabilities:", error)
      } finally {
        setIsLoadingAvailabilities(false)
      }
    }

    fetchAvailabilities()
  }, [selectedHome?.id])

  const handleSubmit = () => {
    onSubmit({
      homeId: selectedHome?.id,
      dateRange,
      message,
    })
  }

  // Convert availabilities to DateRange format
  const availableDateRanges = availabilities.map((availability) => ({
    from: new Date(availability.start_date || availability.startDate),
    to: new Date(availability.end_date || availability.endDate),
  }))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Ruilverzoek indienen</h2>
      <p>
        Je selecteerde <strong>{selectedHome?.title}</strong>. Vul hieronder de gewenste data in en een bericht voor de
        eigenaar.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="date">Beschikbaarheid</label>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
          availableDateRanges={availableDateRanges}
        />
        {isLoadingAvailabilities && <p className="text-sm text-gray-500">Beschikbaarheid laden...</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message">Bericht</label>
        <textarea
          id="message"
          className="border rounded-md p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit}>Verzoek indienen</Button>
    </div>
  )
}
