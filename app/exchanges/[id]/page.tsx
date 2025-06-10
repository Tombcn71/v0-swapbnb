import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import ExchangeMessages from "./components/exchange-messages"
import ExchangeForm from "./components/exchange-form"
import { notFound } from "next/navigation"

export default async function ExchangePage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      redirect("/login")
    }

    let exchange, messages, otherUser

    try {
      const exchangeResult = await sql`
        SELECT e.*, 
               rh.title as requester_home_title, rh.city as requester_home_city,
               hh.title as host_home_title, hh.city as host_home_city,
               ru.name as requester_name, ru.email as requester_email, ru.avatar_url as requester_avatar,
               hu.name as host_name, hu.email as host_email, hu.avatar_url as host_avatar
        FROM exchanges e
        LEFT JOIN homes rh ON e.requester_home_id = rh.id
        LEFT JOIN homes hh ON e.host_home_id = hh.id
        LEFT JOIN users ru ON e.requester_id = ru.id
        LEFT JOIN users hu ON e.host_id = hu.id
        WHERE e.id = ${params.id}
      `

      if (exchangeResult.length === 0) {
        notFound()
      }

      exchange = exchangeResult[0]

      // Controleer of gebruiker toegang heeft
      if (exchange.requester_email !== session.user.email && exchange.host_email !== session.user.email) {
        redirect("/exchanges")
      }

      // Haal berichten op
      messages = await sql`
        SELECT * FROM exchange_messages 
        WHERE exchange_id = ${params.id} 
        ORDER BY created_at ASC
      `

      // Bepaal andere gebruiker
      otherUser =
        exchange.requester_email === session.user.email
          ? {
              name: exchange.host_name,
              email: exchange.host_email,
              avatar_url: exchange.host_avatar,
            }
          : {
              name: exchange.requester_name,
              email: exchange.requester_email,
              avatar_url: exchange.requester_avatar,
            }
    } catch (error) {
      console.error("Database error:", error)
      throw new Error("Failed to load exchange data")
    }

    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Exchange with {otherUser.name}</h1>
        <p>
          Home:{" "}
          {exchange.requester_email === session.user.email ? exchange.host_home_title : exchange.requester_home_title}
        </p>
        <ExchangeMessages messages={messages} userEmail={session.user.email} otherUser={otherUser} />
        <ExchangeForm exchangeId={params.id} userEmail={session.user.email} />
      </div>
    )
  } catch (error) {
    console.error("Page error:", error)
    throw error
  }
}
