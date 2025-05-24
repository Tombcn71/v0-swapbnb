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

// GET /api/exchanges/[id] - Haal een specifieke uitwisseling op
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or you don't have access to it" }, { status: 404 })
    }

    return NextResponse.json(exchanges[0])
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return NextResponse.json({ error: "Failed to fetch exchange" }, { status: 500 })
  }
}

// PATCH /api/exchanges/[id] - Update de status van een uitwisseling
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status } = await request.json()

    // Valideer input
    if (!status || !["pending", "accepted", "rejected", "completed", "cancelled", "confirmed"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    // Controleer of de gebruiker de host is van deze uitwisseling
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (host_id = $2 OR requester_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json(
        { error: "Exchange not found or you don't have permission to update it" },
        { status: 403 },
      )
    }

    const exchange = exchanges[0]

    // Alleen de host kan een uitwisseling accepteren of afwijzen
    if ((status === "accepted" || status === "rejected") && exchange.host_id !== userId) {
      return NextResponse.json({ error: "Only the host can accept or reject an exchange" }, { status: 403 })
    }

    // Alleen de aanvrager kan een uitwisseling annuleren
    if (status === "cancelled" && exchange.requester_id !== userId) {
      return NextResponse.json({ error: "Only the requester can cancel an exchange" }, { status: 403 })
    }

    // Update de status van de uitwisseling
    await executeQuery("UPDATE exchanges SET status = $1, updated_at = NOW() WHERE id = $2", [status, exchangeId])

    // Haal de bijgewerkte uitwisseling op
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
    console.error("Error updating exchange:", error)
    return NextResponse.json({ error: "Failed to update exchange" }, { status: 500 })
  }
}
