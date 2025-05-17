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

// POST /api/exchanges/[id]/payment - Betaal de servicekosten
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

    // Haal de uitwisseling op
    const exchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer of de gebruiker betrokken is bij de uitwisseling
    if (exchange.requester_id !== session.user.id && exchange.host_id !== session.user.id) {
      return NextResponse.json({ error: "You are not involved in this exchange" }, { status: 403 })
    }

    // Bepaal welke rol de gebruiker heeft
    const isRequester = exchange.requester_id === session.user.id
    const paymentField = isRequester ? "requester_payment_status" : "host_payment_status"

    // Controleer of de betaling al is gedaan
    if (exchange[paymentField] === "paid") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    // In een echte applicatie zou hier de betalingsverwerking plaatsvinden
    // Voor deze demo markeren we de betaling gewoon als voltooid

    // Update de betalingsstatus
    await executeQuery(`UPDATE exchanges SET ${paymentField} = $1 WHERE id = $2`, ["paid", exchangeId])

    // Controleer of beide partijen hebben betaald
    const updatedExchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])

    const updatedExchange = updatedExchanges[0]

    if (updatedExchange.requester_payment_status === "paid" && updatedExchange.host_payment_status === "paid") {
      // Als beide partijen hebben betaald, update de status naar confirmed
      await executeQuery("UPDATE exchanges SET status = $1 WHERE id = $2", ["confirmed", exchangeId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
