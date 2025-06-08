import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import SimplifiedExchangeDetail from "@/components/exchanges/simplified-exchange-detail"

export default async function ExchangeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const exchangeId = params.id

  // Get the exchange with related data
  const exchange = await db.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      guest: true,
      host: true,
    },
  })

  if (!exchange) {
    redirect("/exchanges")
  }

  // Check if the user is part of this exchange
  if (exchange.guestId !== session.user.id && exchange.hostId !== session.user.id) {
    redirect("/exchanges")
  }

  // Get the homes involved in the exchange
  const guestHome = await db.home.findUnique({
    where: { id: exchange.guestHomeId },
  })

  const hostHome = await db.home.findUnique({
    where: { id: exchange.hostHomeId },
  })

  if (!guestHome || !hostHome) {
    redirect("/exchanges")
  }

  // Get the other user
  const otherUserId = exchange.guestId === session.user.id ? exchange.hostId : exchange.guestId
  const otherUser = await db.user.findUnique({
    where: { id: otherUserId },
  })

  if (!otherUser) {
    redirect("/exchanges")
  }

  // Get messages for this exchange
  const messages = await db.message.findMany({
    where: { exchangeId },
    orderBy: { createdAt: "asc" },
  })

  return (
    <SimplifiedExchangeDetail
      exchange={exchange}
      guestHome={guestHome}
      hostHome={hostHome}
      messages={messages}
      otherUser={otherUser}
    />
  )
}
