"use client"

import { useState, useEffect } from "react"
import { ExchangeChat } from "./exchange-chat"
import { ExchangesSidebar } from "./exchanges-sidebar"
import { useWindowSize } from "@/hooks/use-window-size"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface SimplifiedExchangeDetailProps {
  exchange: any
  allExchanges: any[]
  currentUserId: string
}

export function SimplifiedExchangeDetail({ exchange, allExchanges, currentUserId }: SimplifiedExchangeDetailProps) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile } = useWindowSize()
  const [showSidebar, setShowSidebar] = useState(!isMobile)

  const isRequester = exchange.requester_id === currentUserId
  const isHost = exchange.host_id === currentUserId

  useEffect(() => {
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

    fetchMessages()

    // Mark messages as read
    const markAsRead = async () => {
      try {
        await fetch(`/api/exchanges/${exchange.id}/messages/read`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    }

    markAsRead()
  }, [exchange.id])

  useEffect(() => {
    setShowSidebar(!isMobile)
  }, [isMobile])

  const handleMessageSent = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error refreshing messages:", error)
    }
  }

  const handleStatusUpdate = () => {
    window.location.reload()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <ExchangesSidebar exchanges={allExchanges} currentExchangeId={exchange.id} currentUserId={currentUserId} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with back button */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/exchanges">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img
                src={
                  isRequester
                    ? exchange.host_profile_image || "/placeholder.svg?height=32&width=32&query=user"
                    : exchange.requester_profile_image || "/placeholder.svg?height=32&width=32&query=user"
                }
                alt={isRequester ? exchange.host_name : exchange.requester_name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{isRequester ? exchange.host_name : exchange.requester_name}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? "Verberg" : "Alle swaps"}
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
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
        </div>
      </div>
    </div>
  )
}
