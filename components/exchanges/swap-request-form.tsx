"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users } from "lucide-react"

interface SwapRequestFormProps {
  targetHome: any
  userHomes: any[]
}

export function SwapRequestForm({ targetHome, userHomes }: SwapRequestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedHomeId, setSelectedHomeId] = useState<string>(userHomes.length > 0 ? userHomes[0].id : "")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [guests, setGuests] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    if (!selectedHomeId || !startDate || !endDate || !message.trim()) {
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
          startDate,
          endDate,
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

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full">
            Inloggen voor swap
          </Button>
        </CardContent>
      </Card>
    )
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap aanvragen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Aankomst</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label>Vertrek</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
