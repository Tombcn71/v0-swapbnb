import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Haal exchange op
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Check if exchange is accepted or videocall completed
    if (exchange.status !== "accepted" && exchange.status !== "videocall_completed") {
      return NextResponse.json(
        { error: "Exchange must be accepted or videocall completed before confirmation" },
        { status: 400 },
      )
    }

    const isRequester = exchange.requester_id === userId

    // Voeg confirmation fields toe als ze niet bestaan
    try {
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS requester_confirmed BOOLEAN DEFAULT false
      `)
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS host_confirmed BOOLEAN DEFAULT false
      `)
    } catch (error) {
      console.log("Confirmation columns already exist")
    }

    // Check if already confirmed
    const currentExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const confirmationField = isRequester ? "requester_confirmed" : "host_confirmed"

    if (currentExchange[0][confirmationField]) {
      return NextResponse.json({ error: "You have already confirmed this swap" }, { status: 400 })
    }

    // Haal user credits op
    const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [userId])
    const userCredits = userResult[0]?.credits || 0

    // Check if user has enough credits
    if (userCredits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Trek 1 credit af
    await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [userId])

    // Record credit transaction
    await executeQuery(
      `INSERT INTO credits_transactions (user_id, amount, transaction_type, description, exchange_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, -1, "swap_confirmation", `Swap confirmation for exchange ${exchangeId}`, exchangeId],
    )

    // Bevestig de swap
    if (isRequester) {
      await executeQuery("UPDATE exchanges SET requester_confirmed = true WHERE id = $1", [exchangeId])
    } else {
      await executeQuery("UPDATE exchanges SET host_confirmed = true WHERE id = $1", [exchangeId])
    }

    // Check if both parties confirmed
    const updatedExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const bothConfirmed = updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed

    if (bothConfirmed) {
      await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [exchangeId])
    }

    return NextResponse.json({
      success: true,
      both_confirmed: bothConfirmed,
      message: bothConfirmed
        ? "🎉 Swap bevestigd! Beide partijen hebben bevestigd."
        : "✅ Je bevestiging is geregistreerd. Wacht op de andere partij.",
      credits_remaining: userCredits - 1,
    })
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
