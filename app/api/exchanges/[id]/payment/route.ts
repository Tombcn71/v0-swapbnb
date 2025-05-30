import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

// Helper functie om te controleren of een exchange voltooid kan worden
const canCompleteExchange = (exchange: any) => {
  return (
    exchange.requester_payment_status === "paid" &&
    exchange.host_payment_status === "paid" &&
    exchange.requester_identity_verification_status === "verified" &&
    exchange.host_identity_verification_status === "verified"
  )
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Controleer toegang
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    if (exchange.status !== "videocall_completed") {
      return NextResponse.json({ error: "Videocall must be completed first" }, { status: 400 })
    }

    // Bepaal welke gebruiker betaalt
    const isRequester = exchange.requester_id === session.user.id
    const paymentField = isRequester ? "requester_payment_status" : "host_payment_status"
    const identityField = isRequester ? "requester_identity_verification_status" : "host_identity_verification_status"

    // NIEUWE CONTROLE: ID-verificatie moet eerst voltooid zijn
    if (exchange[identityField] !== "verified") {
      return NextResponse.json(
        {
          error: "Identity verification must be completed before payment",
          message: "Je moet eerst je identiteit verifiëren voordat je kunt betalen",
        },
        { status: 400 },
      )
    }

    // Controleer of deze gebruiker al heeft betaald
    if (exchange[paymentField] === "paid") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    // Update alleen de betaling van deze gebruiker
    await executeQuery(`UPDATE exchanges SET ${paymentField} = 'paid' WHERE id = $1`, [exchangeId])

    // Haal de bijgewerkte exchange op
    const updatedExchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const updatedExchange = updatedExchanges[0]

    // Update status naar payment_pending als beide partijen hebben betaald maar nog niet geverifieerd
    if (updatedExchange.requester_payment_status === "paid" && updatedExchange.host_payment_status === "paid") {
      await executeQuery("UPDATE exchanges SET status = 'payment_pending' WHERE id = $1", [exchangeId])
    }

    // ALLEEN markeren als voltooid als ALLE voorwaarden zijn voldaan
    if (canCompleteExchange(updatedExchange)) {
      await executeQuery("UPDATE exchanges SET status = 'completed', completed_at = NOW() WHERE id = $1", [exchangeId])
      console.log(`Exchange ${exchangeId} completed! All requirements met.`)
    }

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
