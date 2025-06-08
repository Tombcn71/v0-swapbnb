"use client"

import { useState } from "react"
import type { Exchange, Home, Message, User } from "@/lib/types"
import ExchangeChat from "./exchange-chat"
import ExchangeDetailsSidebar from "./exchange-details-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SwapProgressIndicator from "./swap-progress-indicator"
import { useWindowSize } from "@/hooks/use-window-size"

interface SimplifiedExchangeDetailProps {
  exchange: Exchange
  guestHome: Home
  hostHome: Home
  messages: Message[]
  otherUser: User
}

export default function SimplifiedExchangeDetail({
  exchange,
  guestHome,
  hostHome,
  messages,
  otherUser,
}: SimplifiedExchangeDetailProps) {
  const [activeTab, setActiveTab] = useState("messages")
  const { isMobile } = useWindowSize()

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <SwapProgressIndicator exchange={exchange} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Tabs for mobile, direct content for desktop */}
        <div className="flex-1">
          {isMobile ? (
            <Tabs defaultValue="messages" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="messages">Berichten</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="bg-white rounded-lg shadow h-[70vh]">
                <ExchangeChat exchange={exchange} initialMessages={messages} otherUser={otherUser} />
              </TabsContent>

              <TabsContent value="details">
                <div className="bg-white rounded-lg shadow">
                  <ExchangeDetailsSidebar exchange={exchange} guestHome={guestHome} hostHome={hostHome} />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="bg-white rounded-lg shadow h-[70vh]">
              <ExchangeChat exchange={exchange} initialMessages={messages} otherUser={otherUser} />
            </div>
          )}
        </div>

        {/* Right side - Only visible on desktop */}
        {!isMobile && (
          <div className="md:w-1/3 lg:w-1/4">
            <ExchangeDetailsSidebar exchange={exchange} guestHome={guestHome} hostHome={hostHome} />
          </div>
        )}
      </div>
    </div>
  )
}
