"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ExchangeDetailsSidebar } from "@/components/exchanges/exchange-details-sidebar"
import { ExchangeChat } from "@/components/exchanges/exchange-chat"
import type { Exchange, Message } from "@/lib/types"

interface SimplifiedExchangeDetailProps {
  exchange: Exchange
  allExchanges: any[]
  currentUserId: string
}

export function SimplifiedExchangeDetail({ exchange, allExchanges, currentUserId }: SimplifiedExchangeDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("messages")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isRequester = exchange.requester_id === currentUserId
  const isHost = exchange.host_id === currentUserId

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Mark messages as read
    const markMessagesAsRead = async () => {
      try {
        await fetch(`/api/exchanges/${exchange.id}/messages/read`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    }

    markMessagesAsRead()

    // Poll for new messages
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [exchange.id])

  const handleStatusUpdate = () => {
    router.refresh()
  }

  const handleMessageSent = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="messages" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="messages">Berichten</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="space-y-4">
                <ExchangeChat
                  exchange={exchange}
                  messages={messages}
                  currentUserId={currentUserId}
                  isRequester={isRequester}
                  isHost={isHost}
                  onMessageSent={handleMessageSent}
                  onStatusUpdate={handleStatusUpdate}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Swap Details</h2>
                  <p>Details over deze swap...</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <ExchangeDetailsSidebar
              exchange={exchange}
              isRequester={isRequester}
              isHost={isHost}
              onStatusUpdate={handleStatusUpdate}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
