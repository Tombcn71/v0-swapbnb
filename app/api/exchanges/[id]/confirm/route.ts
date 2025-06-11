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

    // Check if exchange is accepted
    if (exchange.status !== "accepted" && exchange.status !== "videocall_completed") {
      return NextResponse.json(
        { error: "Exchange must be accepted or videocall completed before confirmation" },
        { status: 400 },
      )
    }

    const isRequester = exchange.requester_id === userId
    const isHost = exchange.host_id === userId

    if (!isRequester && !isHost) {
      return NextResponse.json({ error: "You are not part of this exchange" }, { status: 403 })
    }

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
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS requester_credit_reserved BOOLEAN DEFAULT false
      `)
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS host_credit_reserved BOOLEAN DEFAULT false
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

    // Begin een transactie
    await executeQuery("BEGIN")

    try {
      // Als het de host is en er is nog geen credit gereserveerd, check credits en reserveer
      if (isHost && !currentExchange[0].host_credit_reserved) {
        // Controleer of de host genoeg credits heeft
        const hostResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [userId])

        if (hostResult.length === 0) {
          await executeQuery("ROLLBACK")
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const hostCredits = hostResult[0].credits || 0

        if (hostCredits < 1) {
          await executeQuery("ROLLBACK")
          return NextResponse.json(
            {
              error: "Not enough credits. You need at least 1 credit to confirm a swap.",
              need_credits: true,
            },
            { status: 400 },
          )
        }

        // Verminder de credits van de host
        await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [userId])

        // Voeg een credit transactie toe
        await executeQuery(
          `INSERT INTO credits_transactions (
            user_id, amount, transaction_type, description, exchange_id, created_at
          ) VALUES ($1, -1, 'swap_confirmation', 'Credit gebruikt voor swap bevestiging', $2, NOW())`,
          [userId, exchangeId],
        )

        // Markeer dat de host credit is gereserveerd
        await executeQuery("UPDATE exchanges SET host_credit_reserved = true WHERE id = $1", [exchangeId])
      }

      // Update de bevestiging
      if (isRequester) {
        await executeQuery("UPDATE exchanges SET requester_confirmed = true WHERE id = $1", [exchangeId])
      } else {
        await executeQuery("UPDATE exchanges SET host_confirmed = true WHERE id = $1", [exchangeId])
      }

      // Check if both parties confirmed
      const updatedExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
      const bothConfirmed = updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed

      if (bothConfirmed) {
        await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [
          exchangeId,
        ])
      }

      // Commit de transactie
      await executeQuery("COMMIT")

      return NextResponse.json({
        success: true,
        both_confirmed: bothConfirmed,
        message: bothConfirmed
          ? "Swap bevestigd! Jullie kunnen nu contact opnemen om de details af te spreken."
          : "Je bevestiging is geregistreerd. Wacht op de andere partij.",
      })
    } catch (error) {
      // Rollback bij fouten
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
