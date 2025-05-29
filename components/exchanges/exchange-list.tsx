"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ExchangeCard } from "./exchange-card"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface ExchangeListProps {
  type?: "all" | "pending" | "accepted" | "confirmed"
}

export function ExchangeList({ type = "all" }: ExchangeListProps) {
  const [exchanges, setExchanges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchExchanges = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const response = await fetch("/api/exchanges")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch exchanges")
        }

        const data = await response.json()

        // Filter exchanges based on type
        let filteredExchanges = data
        if (type !== "all") {
          filteredExchanges = data.filter((exchange: any) => exchange.status === type)
        }

        setExchanges(filteredExchanges)
      } catch (error: any) {
        console.error("Error fetching exchanges:", error)
        toast({
          title: "Er is iets misgegaan",
          description: error.message || "Kon de swaps niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchanges()
  }, [session?.user?.id, type, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-end space-x-2">
                <div className="h-9 bg-gray-200 rounded w-24"></div>
                <div className="h-9 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Je moet ingelogd zijn om exchanges te bekijken.</p>
        </CardContent>
      </Card>
    )
  }

  if (exchanges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            {type === "pending"
              ? "Je hebt geen openstaande swap-aanvragen."
              : type === "accepted"
                ? "Je hebt geen geaccepteerde swaps die wachten op bevestiging."
                : type === "confirmed"
                  ? "Je hebt geen bevestigde swaps."
                  : "Je hebt nog geen swap-aanvragen."}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sorteer exchanges: pending eerst, dan op datum
  const sortedExchanges = [...exchanges].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Groepeer pending exchanges apart
  const pendingExchanges = sortedExchanges.filter((ex) => ex.status === "pending")
  const otherExchanges = sortedExchanges.filter((ex) => ex.status !== "pending")

  return (
    <div className="space-y-6">
      {pendingExchanges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-600 flex items-center">
            ⏳ Wacht op actie ({pendingExchanges.length})
          </h3>
          <div className="space-y-4">
            {pendingExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} currentUserId={session.user.id} />
            ))}
          </div>
        </div>
      )}

      {otherExchanges.length > 0 && (
        <div>
          {pendingExchanges.length > 0 && <h3 className="text-lg font-semibold mb-3">Overige exchanges</h3>}
          <div className="space-y-4">
            {otherExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} currentUserId={session.user.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
