import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Directe database verbinding
const db = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Availability ID is required" }, { status: 400 })
    }

    // Controleer of de beschikbaarheid bestaat en van de gebruiker is
    const availabilities = await db.query(
      `SELECT a.id FROM availabilities a
       JOIN homes h ON a.home_id = h.id
       WHERE a.id = $1 AND h.user_id = $2`,
      [id, session.user.id],
    )

    if (!availabilities || availabilities.length === 0) {
      return NextResponse.json({ error: "Availability not found or you are not the owner" }, { status: 404 })
    }

    // Verwijder de beschikbaarheid
    await db.query(`DELETE FROM availabilities WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json({ error: "Failed to delete availability" }, { status: 500 })
  }
}
