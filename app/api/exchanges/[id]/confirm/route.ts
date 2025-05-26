import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Functie om te controleren of een string een geldige UUID is
const isValidUUID = (id: string) => {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// POST /api/exchanges/[id]/confirm - Bevestig een uitwisseling
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Controleer of de exchange ID een geldige UUID is
    if (!isValidUUID(exchangeId)) {
      console.error("Invalid UUID format for exchange ID:", exchangeId)
      return NextResponse.json({ error: "Invalid exchange ID format" }, { status: 400 })
    }

    const userId = session.user.id

    // Controleer of de gebruiker ID een geldige UUID is
    if (!isValidUUID(userId)) {
      console.error("Invalid UUID format for user ID:", userId)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Haal de uitwisseling op
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json(
        { error: "Exchange not found or you don't have permission to confirm it" },
        { status: 403 },
      )
    }

    const exchange = exchanges[0]

    // Controleer of de uitwisseling geaccepteerd is
    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted before it can be confirmed" }, { status: 400 })
    }

    // Bepaal of de gebruiker de aanvrager of gastheer is
    const isRequester = exchange.requester_id === userId
    const confirmationField = isRequester ? "requester_confirmation_status" : "host_confirmation_status"

    // Controleer of de gebruiker al heeft bevestigd
    if (exchange[confirmationField] === "confirmed") {
      return NextResponse.json({ error: "You have already confirmed this exchange" }, { status: 400 })
    }

    // Update de bevestigingsstatus
    await executeQuery(`UPDATE exchanges SET ${confirmationField} = 'confirmed', updated_at = NOW() WHERE id = $1`, [
      exchangeId,
    ])

    // Controleer of beide partijen hebben bevestigd
    const updatedExchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])

    const updatedExchange = updatedExchanges[0]

    // Als beide partijen hebben bevestigd, update de status naar "confirmed"
    if (
      updatedExchange.requester_confirmation_status === "confirmed" &&
      updatedExchange.host_confirmation_status === "confirmed"
    ) {
      await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [exchangeId])
    }

    // Haal de bijgewerkte uitwisseling op met alle details
    const finalExchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city, rh.images as requester_home_images,
              hh.title as host_home_title, hh.city as host_home_city, hh.images as host_home_images,
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

    return NextResponse.json(finalExchanges[0])
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
