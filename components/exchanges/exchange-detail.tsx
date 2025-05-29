"use client"

import { useState, useEffect } from "react"
import { ExchangeChat } from "./exchange-chat"
import { ExchangeSidebar } from "./exchange-sidebar"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailProps {
  exchange: Exchange
  currentUserId: string
}

export function ExchangeDetail({ exchange, currentUserId }: ExchangeDetailProps) {
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
    // Refresh de pagina om de nieuwe status te tonen
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Chat Interface - Links */}
        <div className="lg:col-span-2">
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

        {/* Sidebar - Rechts */}
        <div className="lg:col-span-1">
          <ExchangeSidebar exchange={exchange} isRequester={isRequester} isHost={isHost} />
        </div>
      </div>
    </div>
  )
}
