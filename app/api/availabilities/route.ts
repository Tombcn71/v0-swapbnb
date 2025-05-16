import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/availabilities - Haal beschikbaarheden op
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const homeId = url.searchParams.get("homeId")

    if (!homeId) {
      return NextResponse.json({ error: "Home ID is required" }, { status: 400 })
    }

    console.log(`Fetching availabilities for home ID: ${homeId}`) // Debug log

    const { rows: availabilities } = await sql`
      SELECT 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate", 
        status
      FROM availabilities 
      WHERE home_id = ${homeId}
      ORDER BY start_date ASC
    `

    console.log(`Found ${availabilities?.length || 0} availabilities`) // Debug log

    return NextResponse.json(availabilities || [])
  } catch (error) {
    console.error("Error fetching availabilities:", error)
    return NextResponse.json({ error: "Failed to fetch availabilities" }, { status: 500 })
  }
}

// POST /api/availabilities - Maak een nieuwe beschikbaarheid aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { homeId, startDate, endDate } = body

    console.log("Received availability data:", { homeId, startDate, endDate })

    // Valideer input
    if (!homeId) {
      return NextResponse.json(
        {
          error: "Home ID is required",
          received: { homeId },
        },
        { status: 400 },
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: "Start date and end date are required",
          received: { startDate, endDate },
        },
        { status: 400 },
      )
    }

    // Format dates for PostgreSQL date type (YYYY-MM-DD)
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0]

    console.log(`Creating availability for home ${homeId}: ${formattedStartDate} to ${formattedEndDate}`)

    // Controleer of de woning bestaat en van de gebruiker is
    // Let the database handle the type conversion
    const { rows: homes } = await sql`
      SELECT * FROM homes WHERE id = ${homeId}
    `

    console.log(`Found ${homes?.length || 0} homes with ID ${homeId}`)

    if (!homes || homes.length === 0) {
      return NextResponse.json(
        {
          error: "Home not found",
          homeId: homeId,
        },
        { status: 404 },
      )
    }

    // Check if the user is the owner
    if (homes[0].user_id !== session.user.id) {
      console.log(`User ${session.user.id} is not the owner of home ${homeId} (owner: ${homes[0].user_id})`)
      return NextResponse.json(
        {
          error: "You are not the owner of this home",
          homeId: homeId,
          userId: session.user.id,
          ownerId: homes[0].user_id,
        },
        { status: 403 },
      )
    }

    // Controleer of er overlappende beschikbaarheden zijn
    const { rows: overlapping } = await sql`
      SELECT * FROM availabilities 
      WHERE home_id = ${homeId}
      AND (
        (start_date <= ${formattedStartDate}::date AND end_date >= ${formattedStartDate}::date) 
        OR (start_date <= ${formattedEndDate}::date AND end_date >= ${formattedEndDate}::date) 
        OR (start_date >= ${formattedStartDate}::date AND end_date <= ${formattedEndDate}::date)
      )
    `

    console.log(`Found ${overlapping?.length || 0} overlapping availabilities`)

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        {
          error: "Overlapping availability periods",
          overlapping: overlapping,
        },
        { status: 400 },
      )
    }

    // Maak de beschikbaarheid aan
    console.log("Inserting new availability")
    const { rows: result } = await sql`
      INSERT INTO availabilities (home_id, start_date, end_date, status) 
      VALUES (${homeId}, ${formattedStartDate}::date, ${formattedEndDate}::date, 'available') 
      RETURNING 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate", 
        status
    `

    console.log(`Created availability: ${JSON.stringify(result?.[0] || null)}`)

    if (!result || result.length === 0) {
      throw new Error("Failed to create availability - no result returned")
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json(
      {
        error: "Failed to create availability",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
