"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, CreditCard, AlertCircle } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { SimpleCreditModal } from "./simple-credit-modal"

interface SwapRequestFormProps {
  targetHome: any
  userHomes: any[]
}

export function SwapRequestForm({ targetHome, userHomes }: SwapRequestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedHomeId, setSelectedHomeId] = useState<string>(userHomes.length > 0 ? userHomes[0].id : "")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch availabilities for the target home
  useEffect(() => {
    async function fetchAvailabilities() {
      if (!targetHome?.id) return

      try {
        const response = await fetch(`/api/availabilities?homeId=${targetHome.id}`)
        if (response.ok) {
          const data = await response.json()
          setAvailabilities(data || [])
        }
      } catch (error) {
        console.error("Error fetching availabilities:", error)
      }
    }

    fetchAvailabilities()
  }, [targetHome?.id])

  // Fetch user credits ONLY if user is logged in
  useEffect(() => {
    async function fetchUserCredits() {
      if (!session?.user) {
        setIsLoadingCredits(false)
        return
      }

      setIsLoadingCredits(true)
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    fetchUserCredits()
  }, [session?.user])

  // Open modal ONLY for logged in users with insufficient credits
  useEffect(() => {
    if (session?.user && !isLoadingCredits && userCredits !== null && userCredits < 1) {
      setIsModalOpen(true)
    }
  }, [session?.user, isLoadingCredits, userCredits])

  // Convert availabilities to DateRange format
  const availableDateRanges = availabilities.map((availability) => ({
    from: new Date(availability.start_date || availability.startDate),
    to: new Date(availability.end_date || availability.endDate),
  }))

  const handleFormClick = () => {
    // Only show modal for logged in users with insufficient credits
    if (session?.user && !isLoadingCredits && userCredits !== null && userCredits < 1) {
      setIsModalOpen(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    // Check credits for logged in users
    if (!isLoadingCredits && userCredits !== null && userCredits < 1) {
      setIsModalOpen(true)
      return
    }

    if (!selectedHomeId || !dateRange?.from || !dateRange?.to || !message.trim()) {
      toast({
        title: "Vul alle velden in",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterHomeId: selectedHomeId,
          hostHomeId: targetHome.id,
          hostId: targetHome.user_id,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          guests,
          message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Er is iets misgegaan")
      }

      const exchange = await response.json()

      toast({
        title: "Swap aanvraag verzonden!",
        description: `Je aanvraag is verzonden naar ${targetHome.owner_name}`,
      })

      router.push(`/exchanges/${exchange.id}`)
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // SITUATIE 1: Gebruiker is NIET ingelogd
  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Je moet ingelogd zijn om een swap aan te vragen.</p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Inloggen voor swap
          </Button>
        </CardContent>
      </Card>
    )
  }

  // SITUATIE 2: Gebruiker heeft geen woningen
  if (userHomes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Je hebt geen woningen om te ruilen.</p>
          <Button onClick={() => router.push("/homes/new")} className="w-full">
            Woning toevoegen
          </Button>
        </CardContent>
      </Card>
    )
  }

  // SITUATIE 3: Gebruiker is ingelogd en heeft woningen
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Credits info banner - ALLEEN voor ingelogde gebruikers */}
          {!isLoadingCredits && (
            <div
              className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
                userCredits !== null && userCredits < 1
                  ? "bg-amber-50 text-amber-800 cursor-pointer hover:bg-amber-100"
                  : "bg-green-50 text-green-800 cursor-pointer hover:bg-green-100"
              }`}
              onClick={() => setIsModalOpen(true)}
            >
              {userCredits !== null && userCredits < 1 ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Je hebt geen credits meer</p>
                    <p className="text-sm">
                      Klik hier om te leren waarom we credits gebruiken en hoe je ze kunt kopen.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      Je hebt {userCredits} credit{userCredits !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm">
                      1 credit wordt gebruikt bij het versturen van deze aanvraag.{" "}
                      <span className="underline">Meer info</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoadingCredits && (
            <div className="mb-4 p-3 rounded-md bg-gray-100 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
              <span>Credits laden...</span>
            </div>
          )}

          {/* Test button - ALLEEN voor gebruikers met onvoldoende credits */}
          {!isLoadingCredits && userCredits !== null && userCredits < 1 && (
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mb-4 w-full bg-amber-500 hover:bg-amber-600"
            >
              Open Credits Uitleg (TEST KNOP)
            </Button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" onClick={handleFormClick}>
            <div>
              <Label>Je huis</Label>
              <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userHomes.map((home) => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.title} - {home.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Datums</Label>
              <DatePickerWithRange
                dateRange={dateRange}
                setDateRange={setDateRange}
                availableDateRanges={availableDateRanges}
              />
            </div>

            <div>
              <Label>Gasten</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Bericht</Label>
              <Textarea
                placeholder={`Hallo ${targetHome.owner_name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoadingCredits || (userCredits !== null && userCredits < 1)}
            >
              {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal ALLEEN voor ingelogde gebruikers */}
      {session && <SimpleCreditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
