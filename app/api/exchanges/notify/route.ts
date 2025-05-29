import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// POST /api/exchanges/notify - Verstuur notificatie voor nieuwe exchange
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { exchangeId, type } = await request.json()

    // Haal exchange details op
    const exchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city,
              hh.title as host_home_title, hh.city as host_home_city,
              ru.name as requester_name, ru.email as requester_email,
              hu.name as host_name, hu.email as host_email
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.id = $1`,
      [exchangeId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Hier zou je email notificaties kunnen versturen
    // Voor nu loggen we alleen
    console.log(`Notificatie: ${type} voor exchange ${exchangeId}`)

    if (type === "new_request") {
      console.log(`Nieuwe swap aanvraag van ${exchange.requester_name} naar ${exchange.host_name}`)
    } else if (type === "accepted") {
      console.log(`Swap geaccepteerd door ${exchange.host_name}`)
    } else if (type === "confirmed") {
      console.log(`Swap bevestigd - beide partijen akkoord`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
