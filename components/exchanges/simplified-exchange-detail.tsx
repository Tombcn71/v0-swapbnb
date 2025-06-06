"use client"

import { useState, useEffect } from "react"
import { ExchangesSidebar } from "./exchanges-sidebar"
import { ExchangeMessaging } from "./exchange-messaging"
import { ExchangeDetailsSidebar } from "./exchange-details-sidebar"
import type { Exchange } from "@/lib/types"

interface SimplifiedExchangeDetailProps {
  exchange: Exchange
  allExchanges: any[]
  currentUserId: string
}

export function SimplifiedExchangeDetail({ exchange, allExchanges, currentUserId }: SimplifiedExchangeDetailProps) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const isRequester = exchange.requester_id === currentUserId
  const isHost = exchange.host_id === currentUserId

  useEffect(() => {
    fetchMessages()
  }, [exchange.id])

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

  const handleMessageSent = () => {
    fetchMessages()
  }

  const handleStatusUpdate = () => {
    window.location.reload()
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Exchanges List */}
      <div className="w-80 border-r border-gray-200 bg-gray-50">
        <ExchangesSidebar exchanges={allExchanges} currentExchangeId={exchange.id} currentUserId={currentUserId} />
      </div>

      {/* Main Content - Messages */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <ExchangeMessaging
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

        {/* Right Sidebar - Exchange Details */}
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <ExchangeDetailsSidebar exchange={exchange} isRequester={isRequester} isHost={isHost} />
        </div>
      </div>
    </div>
  )
}
