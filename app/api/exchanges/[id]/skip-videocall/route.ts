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

    if (exchange[0].status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted first" }, { status: 400 })
    }

    // Sla videocall over en ga direct naar payment_pending
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_completed',
           videocall_completed_at = NOW(),
           updated_at = NOW() 
       WHERE id = $1`,
      [exchangeId],
    )

    return NextResponse.json({ success: true, message: "Videocall skipped successfully" })
  } catch (error) {
    console.error("Error skipping videocall:", error)
    return NextResponse.json({ error: "Failed to skip videocall" }, { status: 500 })
  }
}
