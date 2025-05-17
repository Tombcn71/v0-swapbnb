"use client"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  value?: DateRange
  onChange: (value: DateRange | undefined) => void
  availableDates?: { from: Date; to: Date }[]
}

export function DatePickerWithRange({ value, onChange, availableDates = [] }: DatePickerWithRangeProps) {
  // Functie om te controleren of een datum beschikbaar is
  const isDateAvailable = (date: Date): boolean => {
    if (availableDates.length === 0) return true

    return availableDates.some((range) => date >= range.from && date <= range.to)
  }

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "PPP", { locale: nl })} - {format(value.to, "PPP", { locale: nl })}
                </>
              ) : (
                format(value.from, "PPP", { locale: nl })
              )
            ) : (
              <span>Selecteer een datum</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            disabled={availableDates.length > 0 ? (date) => !isDateAvailable(date) : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
