"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import Image from "next/image"
import type { Home, Availability } from "@/lib/types"

interface SwapRequestFormProps {
  home: Home & { owner: { id: string; name: string; email: string } }
  userHomes: Array<{ id: string; title: string; city: string }>
  availabilities: Availability[]
}

export function SwapRequestForm({ home, userHomes, availabilities }: SwapRequestFormProps) {
  const [selectedHomeId, setSelectedHomeId] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Converteer beschikbaarheden naar datumbereiken
  const availableDateRanges = availabilities.map((avail) => ({
    from: new Date(avail.start_date),
    to: new Date(avail.end_date),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedHomeId) {
      toast({
        title: "Selecteer een woning",
        description: "Je moet een van je woningen selecteren voor de swap",
        variant: "destructive",
      })
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Selecteer datums",
        description: "Je moet een datumbereik selecteren voor de swap",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostHomeId: home.id,
          requesterHomeId: selectedHomeId,
          startDate: format(dateRange.from, "yyyy-MM-dd"),
          endDate: format(dateRange.to, "yyyy-MM-dd"),
          message: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create swap request")
      }

      const data = await response.json()

      toast({
        title: "Swap-verzoek ingediend",
        description: "Je swap-verzoek is succesvol ingediend",
      })

      router.push(`/exchanges/${data.id}`)
    } catch (error) {
      console.error("Error creating swap request:", error)
      toast({
        title: "Fout bij indienen",
        description:
          error instanceof Error ? error.message : "Er is een fout opgetreden bij het indienen van je swap-verzoek",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Geselecteerde woning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video relative rounded-md overflow-hidden">
                <Image
                  src={home.image_url || "/placeholder.svg?height=400&width=600&query=house"}
                  alt={home.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{home.title}</h3>
                <p className="text-gray-500">
                  {home.city}, {home.country}
                </p>
              </div>
              <div>
                <p className="font-medium">Eigenaar:</p>
                <p>{home.owner?.name || home.host_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beschikbare periodes</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilities.length > 0 ? (
              <ul className="space-y-2">
                {availabilities.map((avail, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(new Date(avail.start_date), "d MMMM yyyy")} -{" "}
                      {format(new Date(avail.end_date), "d MMMM yyyy")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Geen beschikbare periodes gevonden</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Swap-verzoek indienen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="home">Selecteer je woning</Label>
                <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
                  <SelectTrigger id="home">
                    <SelectValue placeholder="Selecteer een woning" />
                  </SelectTrigger>
                  <SelectContent>
                    {userHomes.map((userHome) => (
                      <SelectItem key={userHome.id} value={userHome.id}>
                        {userHome.title} ({userHome.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Selecteer datums</Label>
                <DatePickerWithRange
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  availableDateRanges={availableDateRanges}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Bericht (optioneel)</Label>
                <Textarea
                  id="message"
                  placeholder="Vertel iets over je swap-verzoek..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verzoek indienen..." : "Swap-verzoek indienen"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start text-sm text-gray-500">
            <p>Door een swap-verzoek in te dienen, ga je akkoord met de voorwaarden.</p>
            <p>Na acceptatie door beide partijen wordt een servicekosten in rekening gebracht.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
