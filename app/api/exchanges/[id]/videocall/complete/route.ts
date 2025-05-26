import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update exchange status
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_completed', videocall_completed_at = NOW()
       WHERE id = $1 AND (requester_id = $2 OR host_id = $2)`,
      [params.id, session.user.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error completing videocall:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
