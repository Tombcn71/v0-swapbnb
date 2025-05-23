import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Directe database verbinding
const db = neon(process.env.DATABASE_URL!)

// GET /api/availabilities - Haal beschikbaarheden op
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const homeId = url.searchParams.get("homeId")

    if (!homeId) {
      return NextResponse.json({ error: "Home ID is required" }, { status: 400 })
    }

    console.log(`Fetching availabilities for home ID: ${homeId}`)

    // Gebruik directe query met prepared statement
    const availabilities = await db.query(
      `SELECT 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate", 
        status
       FROM availabilities 
       WHERE home_id = $1
       ORDER BY start_date ASC`,
      [homeId],
    )

    console.log(`Found ${availabilities.length} availabilities`)

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

    if (!homeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format dates for PostgreSQL
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0]

    console.log(`Creating availability for home ${homeId}: ${formattedStartDate} to ${formattedEndDate}`)

    // Stap 1: Controleer of de woning bestaat
    const homes = await db.query(`SELECT id, user_id FROM homes WHERE id = $1`, [homeId])

    console.log(`Found ${homes.length} homes with ID ${homeId}`)

    if (homes.length === 0) {
      // Probeer een directe query met string
      console.log(`Home not found with ID ${homeId}, trying direct query...`)

      // Directe query met string
      const directHomes = await db.query(`SELECT id, user_id FROM homes WHERE id = '${homeId}'`)

      console.log(`Found ${directHomes.length} homes with direct query`)

      if (directHomes.length === 0) {
        return NextResponse.json(
          {
            error: "Home not found with either method",
            homeId: homeId,
          },
          { status: 404 },
        )
      }

      console.log(`Found home with direct query: ${JSON.stringify(directHomes[0])}`)

      // Gebruik het resultaat van de directe query
      if (directHomes[0].user_id !== session.user.id) {
        return NextResponse.json({ error: "You are not the owner of this home" }, { status: 403 })
      }

      // Stap 3: Controleer op overlappende beschikbaarheden
      const overlapping = await db.query(
        `SELECT id FROM availabilities 
         WHERE home_id = $1
         AND (
           (start_date <= $2::date AND end_date >= $2::date) 
           OR (start_date <= $3::date AND end_date >= $3::date) 
           OR (start_date >= $2::date AND end_date <= $3::date)
         )`,
        [homeId, formattedStartDate, formattedEndDate],
      )

      console.log(`Found ${overlapping.length} overlapping availabilities`)

      if (overlapping.length > 0) {
        return NextResponse.json({ error: "Overlapping availability periods" }, { status: 400 })
      }

      // Stap 4: Voeg de beschikbaarheid toe
      const result = await db.query(
        `INSERT INTO availabilities (id, home_id, start_date, end_date, status) 
         VALUES (gen_random_uuid(), $1, $2::date, $3::date, 'available') 
         RETURNING id, home_id as "homeId", start_date as "startDate", end_date as "endDate", status`,
        [homeId, formattedStartDate, formattedEndDate],
      )

      console.log(`Inserted availability: ${JSON.stringify(result[0])}`)

      if (result.length === 0) {
        throw new Error("Failed to create availability")
      }

      return NextResponse.json(result[0], { status: 201 })
    }

    // Stap 2: Controleer of de gebruiker de eigenaar is
    const home = homes[0]
    if (home.user_id !== session.user.id) {
      return NextResponse.json({ error: "You are not the owner of this home" }, { status: 403 })
    }

    // Stap 3: Controleer op overlappende beschikbaarheden
    const overlapping = await db.query(
      `SELECT id FROM availabilities 
       WHERE home_id = $1
       AND (
         (start_date <= $2::date AND end_date >= $2::date) 
         OR (start_date <= $3::date AND end_date >= $3::date) 
         OR (start_date >= $2::date AND end_date <= $3::date)
       )`,
      [homeId, formattedStartDate, formattedEndDate],
    )

    console.log(`Found ${overlapping.length} overlapping availabilities`)

    if (overlapping.length > 0) {
      return NextResponse.json({ error: "Overlapping availability periods" }, { status: 400 })
    }

    // Stap 4: Voeg de beschikbaarheid toe
    const result = await db.query(
      `INSERT INTO availabilities (id, home_id, start_date, end_date, status) 
       VALUES (gen_random_uuid(), $1, $2::date, $3::date, 'available') 
       RETURNING id, home_id as "homeId", start_date as "startDate", end_date as "endDate", status`,
      [homeId, formattedStartDate, formattedEndDate],
    )

    console.log(`Inserted availability: ${JSON.stringify(result[0])}`)

    if (result.length === 0) {
      throw new Error("Failed to create availability")
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
