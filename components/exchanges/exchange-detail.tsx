"use client"

import { ExchangeChat } from "./exchange-chat"
import { ExchangeSidebar } from "./exchange-sidebar"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeDetail({ exchange, isRequester }: ExchangeDetailProps) {
  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Section - Left Side */}
      <div className="flex-1">
        <ExchangeChat exchange={exchange} isRequester={isRequester} />
      </div>

      {/* Sidebar - Right Side */}
      <ExchangeSidebar exchange={exchange} isRequester={isRequester} />
    </div>
  )
}
