"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface Exchange {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ In afwachting</Badge>
    case "accepted":
      return <Badge className="bg-blue-100 text-blue-800">✓ Geaccepteerd</Badge>
    case "confirmed":
      return <Badge className="bg-green-100 text-green-800">✓ Bevestigd</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800">✓ Voltooid</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-800">✗ Afgewezen</Badge>
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800">✗ Geannuleerd</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const ExchangeCard = ({ exchange }: { exchange: Exchange }) => {
  return (
    <Link href={`/exchanges/${exchange.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>{exchange.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{exchange.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{new Date(exchange.createdAt).toLocaleDateString()}</span>
            {getStatusBadge(exchange.status)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const ExchangesPage = () => {
  const [exchanges, setExchanges] = useState<Exchange[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/exchanges")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setExchanges(data)
      } catch (error) {
        console.error("Failed to fetch exchanges:", error)
        setExchanges([])
      } finally {
        setLoading(false)
      }
    }

    fetchExchanges()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-5">Uitwisselingen</h1>
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[200px]" />
                <div className="mt-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exchanges && exchanges.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {exchanges.map((exchange) => (
            <ExchangeCard key={exchange.id} exchange={exchange} />
          ))}
        </div>
      ) : (
        <p>Geen uitwisselingen gevonden.</p>
      )}
    </div>
  )
}

export default ExchangesPage
