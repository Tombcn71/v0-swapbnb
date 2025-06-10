import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ExchangeChat } from "@/components/exchanges/exchange-chat"
import { ExchangesSidebar } from "@/components/exchanges/exchanges-sidebar"

async function getExchange(id: string, userId: string) {
  const exchangeQuery = `
    SELECT e.*, 
           CASE 
             WHEN e.requester_id = $2 THEN hu.name 
             ELSE ru.name 
           END as other_user_name,
           CASE 
             WHEN e.requester_id = $2 THEN hu.profile_image 
             ELSE ru.profile_image 
           END as other_user_image
    FROM exchanges e
    JOIN homes rh ON e.requester_home_id = rh.id
    JOIN homes hh ON e.host_home_id = hh.id
    JOIN users ru ON e.requester_id = ru.id
    JOIN users hu ON e.host_id = hu.id
    WHERE e.id = $1
    AND (e.requester_id = $2 OR e.host_id = $2)
  `

  const exchange = await executeQuery(exchangeQuery, [id, userId])

  return exchange[0]
}

async function getMessages(exchangeId: string) {
  const messagesQuery = `
    SELECT m.*, u.name, u.profile_image
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.exchange_id = $1
    ORDER BY m.created_at ASC
  `

  const messages = await executeQuery(messagesQuery, [exchangeId])

  return messages
}

async function getUser(id: string, exchange: any) {
  const otherUserId = exchange.requester_id === id ? exchange.host_id : exchange.requester_id

  const userQuery = `
    SELECT *
    FROM users
    WHERE id = $1
  `

  const user = await executeQuery(userQuery, [otherUserId])

  return user[0]
}

export default async function ExchangePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const exchange = await getExchange(params.id, session.user.id)
  const messages = await getMessages(params.id)
  const otherUser = await getUser(session.user.id, exchange)

  // Haal alle exchanges op voor de sidebar
  const allExchangesQuery = `
  SELECT e.*, 
         CASE 
           WHEN e.requester_id = $1 THEN hu.name 
           ELSE ru.name 
         END as other_user_name,
         CASE 
           WHEN e.requester_id = $1 THEN hu.profile_image 
           ELSE ru.profile_image 
         END as other_user_image,
         CASE 
           WHEN e.requester_id = $1 THEN hh.city 
           ELSE rh.city 
         END as other_user_city
  FROM exchanges e
  JOIN homes rh ON e.requester_home_id = rh.id
  JOIN homes hh ON e.host_home_id = hh.id
  JOIN users ru ON e.requester_id = ru.id
  JOIN users hu ON e.host_id = hu.id
  WHERE e.requester_id = $1 OR e.host_id = $1
  ORDER BY e.created_at DESC
`

  const allExchanges = await executeQuery(allExchangesQuery, [session.user.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200">
          <ExchangesSidebar exchanges={allExchanges} currentExchangeId={params.id} currentUserId={session.user.id} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <ExchangeChat exchange={exchange} initialMessages={messages} otherUser={otherUser} />
          </div>
        </div>
      </div>
    </div>
  )
}
