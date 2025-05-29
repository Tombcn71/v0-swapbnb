"use client"

import dynamic from "next/dynamic"

const ConversationList = dynamic(
  () => import("@/components/messaging/conversation-list").then((mod) => mod.ConversationList),
  { ssr: false },
)

export function ConversationListWrapper() {
  return <ConversationList />
}
