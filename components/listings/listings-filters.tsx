"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { CalendarIcon, Search, X } from "lucide-react"

export function ListingsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [guests, setGuests] = useState(searchParams.get("guests") || "2")
  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (guests) params.set("guests", guests)
    if (date.from) params.set("from", format(date.from, "yyyy-MM-dd"))
    if (date.to) params.set("to", format(date.to, "yyyy-MM-dd"))

    router.push(`/listings?${params.toString()}`)
  }

  const handleReset = () => {
    setLocation("")
    setGuests("2")
    setDate({ from: undefined, to: undefined })
    router.push("/listings")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 min-w-0">
          <Label htmlFor="location" className="text-sm">
            Locatie
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              id="location"
              placeholder="Stad of regio"
              className="pl-9 h-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Label className="text-sm">Periode</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1 h-10">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMM", { locale: nl })} - {format(date.to, "d MMM", { locale: nl })}
                    </>
                  ) : (
                    format(date.from, "d MMM", { locale: nl })
                  )
                ) : (
                  <span className="text-gray-500">Selecteer data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date.from}
                selected={{ from: date.from, to: date.to }}
                onSelect={(range) => setDate({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                locale={nl}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full lg:w-40">
          <Label htmlFor="guests" className="text-sm">
            Gasten
          </Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger id="guests" className="mt-1 h-10">
              <SelectValue placeholder="Gasten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 gast</SelectItem>
              <SelectItem value="2">2 gasten</SelectItem>
              <SelectItem value="3">3 gasten</SelectItem>
              <SelectItem value="4">4 gasten</SelectItem>
              <SelectItem value="5">5 gasten</SelectItem>
              <SelectItem value="6">6+ gasten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} size="sm" className="h-10">
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 h-10 px-6">
            <Search className="mr-2 h-4 w-4" />
            Zoek woningen
          </Button>
        </div>
      </div>
    </div>
  )
}
