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

interface AddAvailabilityFormProps {
  onAdd: (startDate: Date, endDate: Date) => void
}

export function AddAvailabilityForm({ onAdd }: AddAvailabilityFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  const handleAddAvailability = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Selecteer data",
        description: "Selecteer zowel een begin- als einddatum",
        variant: "destructive",
      })
      return
    }

    if (endDate < startDate) {
      toast({
        title: "Ongeldige datums",
        description: "De einddatum moet na de begindatum liggen",
        variant: "destructive",
      })
      return
    }

    // Check if dates are in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      toast({
        title: "Ongeldige begindatum",
        description: "De begindatum kan niet in het verleden liggen",
        variant: "destructive",
      })
      return
    }

    onAdd(startDate, endDate)
    setStartDate(undefined)
    setEndDate(undefined)
    setIsOpen(false)
  }

  const toggleForm = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setStartDate(undefined)
      setEndDate(undefined)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Begindatum</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "d MMMM yyyy", { locale: nl })
                        ) : (
                          <span>Selecteer begindatum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
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

                <div>
                  <label className="block text-sm font-medium mb-2">Einddatum</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "d MMMM yyyy", { locale: nl }) : <span>Selecteer einddatum</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={nl}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today || (startDate ? date < startDate : false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={toggleForm}>
                  Annuleren
                </Button>
                <Button type="button" onClick={handleAddAvailability} className="bg-google-blue hover:bg-blue-600">
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
