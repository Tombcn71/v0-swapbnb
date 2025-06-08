"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExchangeChat } from "@/components/exchanges/exchange-chat"
import { ExchangeDetailsSidebar } from "@/components/exchanges/exchange-details-sidebar"
import { ExchangesSidebar } from "@/components/exchanges/exchanges-sidebar"
import { useWindowSize } from "@/hooks/use-window-size"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface SimplifiedExchangeDetailProps {
  exchange: any
  allExchanges: any[]
  currentUserId: string
}

export function SimplifiedExchangeDetail({ exchange, allExchanges, currentUserId }: SimplifiedExchangeDetailProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequester, setIsRequester] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const { isMobile } = useWindowSize()
  const router = useRouter()

  useEffect(() => {
    setIsRequester(exchange.requester_id === currentUserId)
    setIsHost(exchange.host_id === currentUserId)
    fetchMessages()
  }, [exchange, currentUserId])

  const fetchMessages = async () => {
    setIsLoading(true)
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

  const handleMessageSent = () => {
    fetchMessages()
  }

  const handleStatusUpdate = () => {
    router.refresh()
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: nl })
  }

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left sidebar - only on desktop */}
        {!isMobile && (
          <div className="hidden md:block md:col-span-3">
            <ExchangesSidebar exchanges={allExchanges} currentExchangeId={exchange.id} currentUserId={currentUserId} />
          </div>
        )}

        {/* Main content */}
        <div className="md:col-span-6">
          {isMobile && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
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
                <Card>
                  <CardContent className="pt-6">
                    <ExchangeDetailsSidebar
                      exchange={exchange}
                      isRequester={isRequester}
                      isHost={isHost}
                      formatDate={formatDate}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {!isMobile && (
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
          )}
        </div>

        {/* Right sidebar - only on desktop */}
        {!isMobile && (
          <div className="hidden md:block md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <ExchangeDetailsSidebar
                  exchange={exchange}
                  isRequester={isRequester}
                  isHost={isHost}
                  formatDate={formatDate}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
