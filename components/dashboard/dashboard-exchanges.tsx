"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange } from "@/lib/types"

export function DashboardExchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchExchanges = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/exchanges?type=upcoming")
        if (!response.ok) {
          throw new Error("Failed to fetch exchanges")
        }

        const data = await response.json()
        setExchanges(data)
      } catch (error) {
        console.error("Error fetching exchanges:", error)
        toast({
          title: "Er is iets misgegaan",
          description: "Kon de uitwisselingen niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchanges()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex justify-end">
              <div className="h-9 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (exchanges.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600 py-8">Je hebt nog geen aankomende uitwisselingen</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/listings">Zoek woningen</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exchanges.map((exchange) => (
        <Card key={exchange.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={`/abstract-geometric-shapes.png?height=400&width=600&query=${exchange.homeTitle}`}
              alt={exchange.homeTitle}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Geaccepteerd</Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{exchange.homeTitle}</h3>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{exchange.homeCity}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {format(new Date(exchange.startDate), "d MMMM yyyy", { locale: nl })} -{" "}
                {format(new Date(exchange.endDate), "d MMMM yyyy", { locale: nl })}
              </span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full">
              <Link href={`/exchanges/${exchange.id}`}>Bekijk details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
