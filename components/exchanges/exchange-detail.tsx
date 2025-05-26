"use client"

import { useState } from "react"
import { ExchangeChat } from "./exchange-chat"
import { ExchangeSidebar } from "./exchange-sidebar"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailProps {
  exchange: Exchange
  currentUserId: string
}

export function ExchangeDetail({ exchange, currentUserId }: ExchangeDetailProps) {
  const [currentExchange, setCurrentExchange] = useState(exchange)

  const handleExchangeUpdate = (updatedExchange: Exchange) => {
    setCurrentExchange(updatedExchange)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Chat Interface - Links */}
          <div className="lg:col-span-2">
            <ExchangeChat
              exchange={currentExchange}
              currentUserId={currentUserId}
              onExchangeUpdate={handleExchangeUpdate}
            />
          </div>

          {/* Sidebar - Rechts */}
          <div className="lg:col-span-1">
            <ExchangeSidebar exchange={currentExchange} currentUserId={currentUserId} />
          </div>
        </div>
      </div>
    </div>
  )
}
