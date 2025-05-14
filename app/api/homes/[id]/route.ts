import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET /api/homes/[id] - Haal een specifieke woning op
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const homeId = params.id

    console.log(`Fetching home with ID: ${homeId}`)

    // Haal de woning op
    const home = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.image as owner_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [homeId],
    )

    if (home.length === 0) {
      console.log(`Home with ID ${homeId} not found`)
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    console.log(`Found home: ${home[0].title}`)

    // Haal de beschikbaarheden op
    const availabilities = await executeQuery(
      "SELECT * FROM availabilities WHERE home_id = $1 ORDER BY start_date ASC",
      [homeId],
    )

    console.log(`Found ${availabilities.length} availabilities`)

    // Haal de beoordelingen op
    const reviews = await executeQuery(
      `SELECT r.*, u.name as reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.home_id = $1
       ORDER BY r.created_at DESC`,
      [homeId],
    )

    console.log(`Found ${reviews.length} reviews`)

    // Combineer de gegevens
    const result = {
      ...home[0],
      availabilities,
      reviews,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}
