import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/homes - Haal woningen op
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const city = url.searchParams.get("city")
    const minBedrooms = url.searchParams.get("minBedrooms")
    const maxBedrooms = url.searchParams.get("maxBedrooms")
    const minGuests = url.searchParams.get("minGuests")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const amenities = url.searchParams.get("amenities")?.split(",") || []

    console.log("API filters applied:", { city, minBedrooms, maxBedrooms, minGuests, startDate, endDate, amenities })

    let query = `
      SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (city) {
      query += ` AND LOWER(h.city) LIKE LOWER($${paramIndex})`
      params.push(`%${city}%`)
      paramIndex++
    }

    if (minBedrooms) {
      query += ` AND h.bedrooms >= $${paramIndex}`
      params.push(Number.parseInt(minBedrooms))
      paramIndex++
    }

    if (maxBedrooms) {
      query += ` AND h.bedrooms <= $${paramIndex}`
      params.push(Number.parseInt(maxBedrooms))
      paramIndex++
    }

    if (minGuests) {
      query += ` AND h.max_guests >= $${paramIndex}`
      params.push(Number.parseInt(minGuests))
      paramIndex++
    }

    // Filter op beschikbaarheid als startDate en endDate zijn opgegeven
    if (startDate && endDate) {
      query += `
        AND EXISTS (
          SELECT 1 FROM availabilities a
          WHERE a.home_id = h.id
          AND a.start_date <= $${paramIndex}
          AND a.end_date >= $${paramIndex + 1}
        )
      `
      params.push(startDate, endDate)
      paramIndex += 2
    }

    // Filter op voorzieningen als deze zijn opgegeven
    if (amenities.length > 0) {
      for (const amenity of amenities) {
        query += ` AND h.amenities->>'${amenity}' = 'true'`
      }
    }

    query += " ORDER BY h.created_at DESC"

    console.log("Final query:", query)
    console.log("Query params:", params)

    const homes = await executeQuery(query, params)
    console.log(
      `Database returned ${homes.length} homes:`,
      homes.map((h) => ({ id: h.id, title: h.title, city: h.city })),
    )

    return NextResponse.json(homes)
  } catch (error) {
    console.error("Error fetching homes:", error)
    return NextResponse.json({ error: "Failed to fetch homes" }, { status: 500 })
  }
}

// POST /api/homes - Maak een nieuwe woning aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log("Unauthorized: No session or user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User from session:", session.user)

    const { title, description, address, city, postalCode, bedrooms, bathrooms, maxGuests, amenities, images } =
      await request.json()

    console.log("Received home data:", { title, city, bedrooms, maxGuests })

    // Valideer input
    if (!title || !description || !address || !city || !postalCode || !bedrooms || !bathrooms || !maxGuests) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "All fields are required except amenities and images" }, { status: 400 })
    }

    // Maak de woning aan
    console.log("Creating home with user_id:", session.user.id)

    const result = await executeQuery(
      `INSERT INTO homes 
       (user_id, title, description, address, city, postal_code, bedrooms, bathrooms, max_guests, amenities, images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        session.user.id,
        title,
        description,
        address,
        city,
        postalCode,
        bedrooms,
        bathrooms,
        maxGuests,
        JSON.stringify(amenities || {}),
        JSON.stringify(images || []),
      ],
    )

    console.log("Home created:", result[0])

    // Haal de volledige woninggegevens op
    const home = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [result[0].id],
    )

    console.log("Home with owner details:", home[0])

    return NextResponse.json(home[0], { status: 201 })
  } catch (error) {
    console.error("Error creating home:", error)
    return NextResponse.json({ error: "Failed to create home" }, { status: 500 })
  }
}
