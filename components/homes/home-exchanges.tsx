"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Exchange } from "@/lib/types"

interface HomeExchangesProps {
  homeId: string
  userId?: string
}

export function HomeExchanges({ homeId, userId }: HomeExchangesProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchExchanges() {
      try {
        const response = await fetch(`/api/exchanges?homeId=${homeId}`)
        if (!response.ok) throw new Error("Failed to fetch exchanges")
        const data = await response.json()
        setExchanges(data)
      } catch (error) {
        console.error("Error fetching exchanges:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het ophalen van de uitwisselingen.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExchanges()
  }, [homeId, toast])

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recente uitwisselingen</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (exchanges.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recente uitwisselingen</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">Er zijn nog geen uitwisselingen voor deze woning.</p>
            {userId && <Button variant="outline">Uitwisseling aanvragen</Button>}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Recente uitwisselingen</h2>
      <div className="space-y-4">
        {exchanges.map((exchange) => (
          <Card key={exchange.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{exchange.guest_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exchange.start_date).toLocaleDateString()} -{" "}
                    {new Date(exchange.end_date).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{exchange.message}</p>
                </div>
                <div className="text-sm font-medium">
                  {exchange.status === "pending" && <span className="text-yellow-500">In afwachting</span>}
                  {exchange.status === "approved" && <span className="text-green-500">Goedgekeurd</span>}
                  {exchange.status === "rejected" && <span className="text-red-500">Afgewezen</span>}
                  {exchange.status === "completed" && <span className="text-blue-500">Voltooid</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
