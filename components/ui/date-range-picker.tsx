"use client"

import type * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  availableDateRanges?: DateRange[]
}

export function DatePickerWithRange({
  className,
  dateRange,
  setDateRange,
  availableDateRanges,
}: DatePickerWithRangeProps) {
  // Functie om te controleren of een datum beschikbaar is
  const isDateAvailable = (date: Date) => {
    if (!availableDateRanges || availableDateRanges.length === 0) return true

    return availableDateRanges.some((range) => {
      const from = new Date(range.from)
      const to = new Date(range.to)
      return date >= from && date <= to
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Selecteer datums</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            disabled={(date) => !isDateAvailable(date)}
            modifiers={{
              available: (date) => isDateAvailable(date),
              unavailable: (date) => !isDateAvailable(date),
            }}
            modifiersStyles={{
              available: {
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontWeight: "600",
                border: "2px solid #16a34a",
              },
              unavailable: {
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                textDecoration: "line-through",
              },
            }}
            className="rounded-md border"
          />
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span>Beschikbaar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
              <span>Niet beschikbaar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
              <span>Geselecteerd</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
