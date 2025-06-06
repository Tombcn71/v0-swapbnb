import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Alleen toestaan als exchange nog pending of rejected is
    if (!["pending", "rejected", "cancelled"].includes(exchange.status)) {
      return NextResponse.json({ error: "Cannot delete exchange with current status" }, { status: 400 })
    }

    // Verwijder gerelateerde berichten eerst
    await executeQuery("DELETE FROM messages WHERE exchange_id = $1", [exchangeId])

    // Verwijder de exchange
    await executeQuery("DELETE FROM exchanges WHERE id = $1", [exchangeId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exchange:", error)
    return NextResponse.json({ error: "Failed to delete exchange" }, { status: 500 })
  }
}
