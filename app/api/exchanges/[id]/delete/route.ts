import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// DELETE /api/exchanges/[id]/delete - Verwijder een uitwisseling uit de berichten
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Controleer of de uitwisseling bestaat en of de gebruiker toegang heeft
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or you don't have access to it" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer of de uitwisseling afgewezen of geannuleerd is
    if (exchange.status !== "rejected" && exchange.status !== "cancelled") {
      return NextResponse.json({ error: "Only rejected or cancelled exchanges can be deleted" }, { status: 400 })
    }

    // Markeer de uitwisseling als verwijderd voor deze gebruiker
    // We gebruiken een soft delete door een vlag te zetten
    if (exchange.requester_id === userId) {
      await executeQuery("UPDATE exchanges SET deleted_by_requester = TRUE WHERE id = $1", [exchangeId])
    } else {
      await executeQuery("UPDATE exchanges SET deleted_by_host = TRUE WHERE id = $1", [exchangeId])
    }

    return NextResponse.json({ success: true, message: "Exchange deleted successfully" })
  } catch (error) {
    console.error("Error deleting exchange:", error)
    return NextResponse.json({ error: "Failed to delete exchange" }, { status: 500 })
  }
}
