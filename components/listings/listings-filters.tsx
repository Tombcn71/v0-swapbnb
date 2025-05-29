"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { CalendarIcon, Search, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function ListingsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [guests, setGuests] = useState(searchParams.get("guests") || "2")
  const [bedrooms, setBedrooms] = useState([1, 5])
  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [amenities, setAmenities] = useState<string[]>([])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (guests) params.set("guests", guests)
    if (bedrooms[0] !== 1 || bedrooms[1] !== 5) {
      params.set("minBedrooms", bedrooms[0].toString())
      params.set("maxBedrooms", bedrooms[1].toString())
    }
    if (date.from) params.set("from", format(date.from, "yyyy-MM-dd"))
    if (date.to) params.set("to", format(date.to, "yyyy-MM-dd"))
    if (amenities.length > 0) params.set("amenities", amenities.join(","))

    router.push(`/listings?${params.toString()}`)
  }

  const handleReset = () => {
    setLocation("")
    setGuests("2")
    setBedrooms([1, 5])
    setDate({ from: undefined, to: undefined })
    setAmenities([])
    router.push("/listings")
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="location">Locatie</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="location"
              placeholder="Stad of regio"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dates">Periode</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMM", { locale: nl })} - {format(date.to, "d MMM", { locale: nl })}
                    </>
                  ) : (
                    format(date.from, "d MMMM yyyy", { locale: nl })
                  )
                ) : (
                  <span>Selecteer data</span>
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

        <div>
          <Label htmlFor="guests">Aantal gasten</Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger id="guests" className="mt-1">
              <SelectValue placeholder="Aantal gasten" />
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

        <div>
          <Label>Aantal slaapkamers</Label>
          <div className="mt-6 px-2">
            <Slider defaultValue={[1, 5]} max={5} min={1} step={1} value={bedrooms} onValueChange={setBedrooms} />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>
                {bedrooms[0]} slaapkamer{bedrooms[0] !== 1 && "s"}
              </span>
              <span>
                {bedrooms[1]} slaapkamer{bedrooms[1] !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <Label className="mb-3 block">Voorzieningen</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="wifi" checked={amenities.includes("wifi")} onCheckedChange={() => toggleAmenity("wifi")} />
            <label
              htmlFor="wifi"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              WiFi
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="parking"
              checked={amenities.includes("parking")}
              onCheckedChange={() => toggleAmenity("parking")}
            />
            <label
              htmlFor="parking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Parkeerplaats
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="garden"
              checked={amenities.includes("garden")}
              onCheckedChange={() => toggleAmenity("garden")}
            />
            <label
              htmlFor="garden"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tuin
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="pets" checked={amenities.includes("pets")} onCheckedChange={() => toggleAmenity("pets")} />
            <label
              htmlFor="pets"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Huisdieren toegestaan
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Reset filters
        </Button>
        <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
          <Search className="mr-2 h-4 w-4" />
          Zoek woningen
        </Button>
      </div>
    </div>
  )
}
