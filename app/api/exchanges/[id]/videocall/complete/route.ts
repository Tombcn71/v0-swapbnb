import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// POST /api/exchanges/[id]/videocall/complete - Markeer videocall als voltooid
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Controleer of de gebruiker deel uitmaakt van deze exchange
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or access denied" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer of de videocall gepland is
    if (exchange.status !== "videocall_scheduled") {
      return NextResponse.json({ error: "Videocall must be scheduled first" }, { status: 400 })
    }

    // Update de exchange status naar videocall_completed
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_completed', 
           videocall_completed_at = NOW(),
           updated_at = NOW() 
       WHERE id = $1`,
      [exchangeId],
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
    console.error("Error completing videocall:", error)
    return NextResponse.json({ error: "Failed to complete videocall" }, { status: 500 })
  }
}
