import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the availability exists
    const { rows: availabilityRows } = await sql`
      SELECT a.id, h.user_id 
      FROM availabilities a
      JOIN homes h ON a.home_id = h.id
      WHERE a.id = ${params.id}
    `

    if (availabilityRows.length === 0) {
      return NextResponse.json({ error: "Availability not found" }, { status: 404 })
    }

    // Check if the user owns the home
    if (availabilityRows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to delete this availability" }, { status: 403 })
    }

    // Delete the availability
    await sql`
      DELETE FROM availabilities WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json({ error: "Failed to delete availability" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the availability exists
    const { rows: availabilityRows } = await sql`
      SELECT a.id, h.user_id, a.home_id
      FROM availabilities a
      JOIN homes h ON a.home_id = h.id
      WHERE a.id = ${params.id}
    `

    if (availabilityRows.length === 0) {
      return NextResponse.json({ error: "Availability not found" }, { status: 404 })
    }

    // Check if the user owns the home
    if (availabilityRows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to update this availability" }, { status: 403 })
    }

    const body = await request.json()
    const { startDate, endDate } = body

    // Update the availability
    const { rows } = await sql`
      UPDATE availabilities
      SET 
        start_date = ${startDate},
        end_date = ${endDate},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate"
    `

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
