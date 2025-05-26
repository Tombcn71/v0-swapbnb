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

    // Controleer toegang
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    if (exchange[0].status !== "videocall_completed") {
      return NextResponse.json({ error: "Videocall must be completed first" }, { status: 400 })
    }

    // Voor demo: markeer direct als betaald
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'completed',
           requester_payment_status = 'paid',
           host_payment_status = 'paid',
           updated_at = NOW() 
       WHERE id = $1`,
      [exchangeId],
    )

    // In productie zou hier Stripe integratie komen
    return NextResponse.json({
      success: true,
      message: "Payment completed successfully",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
