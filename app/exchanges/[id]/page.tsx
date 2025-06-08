"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ExchangeChat } from "@/components/exchanges/exchange-chat"

interface Exchange {
  id: string
  title: string
  description: string
  status: "pending" | "accepted" | "rejected" | "completed"
  requesterId: string
  hostId: string
  createdAt: Date
  updatedAt: Date
  items: { id: string; name: string }[]
}

interface Message {
  id: string
  content: string
  senderId: string
  exchangeId: string
  createdAt: Date
}

export default function ExchangePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: session, status } = useSession()
  const router = useRouter()

  const [exchange, setExchange] = useState<Exchange | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequester, setIsRequester] = useState(false)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (!session?.user) {
      router.push("/login")
      return
    }

    const fetchExchange = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/exchanges/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch exchange")
        }
        const data = await response.json()
        setExchange(data.exchange)
        setMessages(data.messages)
        setIsRequester(data.exchange.requesterId === session.user.id)
        setIsHost(data.exchange.hostId === session.user.id)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchange()
  }, [id, session?.user, router, status])

  const handleAccept = async () => {
    try {
      const response = await fetch(`/api/exchanges/${id}/accept`, {
        method: "PUT",
      })
      if (!response.ok) {
        throw new Error("Failed to accept exchange")
      }
      toast.success("Exchange accepted!")
      handleRefresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/exchanges/${id}/reject`, {
        method: "PUT",
      })
      if (!response.ok) {
        throw new Error("Failed to reject exchange")
      }
      toast.success("Exchange rejected")
      handleRefresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/exchanges/${id}/complete`, {
        method: "PUT",
      })
      if (!response.ok) {
        throw new Error("Failed to complete exchange")
      }
      toast.success("Exchange completed!")
      handleRefresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch exchange")
      }
      const data = await response.json()
      setExchange(data.exchange)
      setMessages(data.messages)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-64" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!exchange) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Exchange not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>{exchange.title}</CardTitle>
          <CardDescription>{exchange.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Status: {exchange.status}</p>
          <p className="text-sm text-muted-foreground">Created at: {exchange.createdAt.toString()}</p>
          <p className="text-sm text-muted-foreground">Items:</p>
          <ul>
            {exchange.items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isHost && exchange.status === "pending" && (
            <>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
              <Button onClick={handleAccept}>Accept</Button>
            </>
          )}
          {(isHost || isRequester) && exchange.status === "accepted" && (
            <Button onClick={handleComplete}>Complete</Button>
          )}
        </CardFooter>
      </Card>
      <ExchangeChat
        exchange={exchange}
        messages={messages}
        currentUserId={session.user.id}
        isRequester={isRequester}
        isHost={isHost}
        onMessageSent={handleRefresh}
        onStatusUpdate={handleRefresh}
        isLoading={isLoading}
      />
    </div>
  )
}
