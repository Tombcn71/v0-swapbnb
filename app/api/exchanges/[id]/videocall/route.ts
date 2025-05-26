import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// POST /api/exchanges/[id]/videocall - Plan een videocall
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id
    const { scheduled_at } = await request.json()

    if (!scheduled_at) {
      return NextResponse.json({ error: "Scheduled date/time is required" }, { status: 400 })
    }

    // Controleer of de gebruiker deel uitmaakt van deze exchange
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or access denied" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer of de exchange geaccepteerd is
    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted before scheduling videocall" }, { status: 400 })
    }

    // Genereer een simpele videocall link (in productie zou dit een echte service zijn)
    const videocallLink = `https://meet.jit.si/swapbnb-${exchangeId}`

    // Update de exchange met videocall informatie
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_scheduled', 
           videocall_scheduled_at = $1, 
           videocall_link = $2,
           updated_at = NOW() 
       WHERE id = $3`,
      [scheduled_at, videocallLink, exchangeId],
    )

    // Haal de bijgewerkte exchange op
    const updatedExchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city,
              hh.title as host_home_title, hh.city as host_home_city,
              ru.name as requester_name, hu.name as host_name
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.id = $1`,
      [exchangeId],
    )

    return NextResponse.json(updatedExchanges[0])
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
