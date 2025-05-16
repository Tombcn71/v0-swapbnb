import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Log the params ID for debugging
    console.log("API GET home - params.id:", params.id)

    const { rows: homes } = await sql`
      SELECT h.*, u.name as host_name
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ${params.id}
    `

    if (!homes || homes.length === 0) {
      console.log("API - No home found with ID:", params.id)
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    const home = homes[0]

    // Log the home data for debugging
    console.log("API - Home found:", home.id)

    return NextResponse.json(home)
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id
    const userId = session.user.id

    console.log("Session user ID:", userId)

    // Verify the user owns this home
    const { rows: homes } = await sql`
      SELECT * FROM homes WHERE id = ${homeId}
    `

    if (!homes || homes.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    console.log("Home owner ID:", homes[0].user_id)
    console.log("Are IDs equal?", homes[0].user_id === userId)
    console.log("Home owner ID type:", typeof homes[0].user_id)
    console.log("Session user ID type:", typeof userId)

    // Convert both IDs to strings for comparison
    if (homes[0].user_id != userId) {
      return NextResponse.json({ error: "Home not found or you're not the owner" }, { status: 403 })
    }

    // Get the current home data to use as fallback for required fields
    const currentHome = homes[0]

    // Update the home
    const {
      title = currentHome.title,
      description = currentHome.description,
      address = currentHome.address,
      city = currentHome.city,
      postalCode,
      bedrooms = currentHome.bedrooms,
      bathrooms = currentHome.bathrooms,
      maxGuests,
      amenities,
      images,
    } = await request.json()

    // Ensure postal_code is not null by using the current value as fallback
    const postal_code = postalCode || currentHome.postal_code

    // Ensure max_guests is not null by using the current value as fallback
    const max_guests = maxGuests || currentHome.max_guests

    // Validate required fields
    if (!title || !description || !address || !city || !postal_code || !bedrooms || !bathrooms || !max_guests) {
      return NextResponse.json(
        {
          error: "All required fields must be provided",
          missingFields: {
            title: !title,
            description: !description,
            address: !address,
            city: !city,
            postal_code: !postal_code,
            bedrooms: !bedrooms,
            bathrooms: !bathrooms,
            max_guests: !max_guests,
          },
        },
        { status: 400 },
      )
    }

    // Update the home
    const { rows: result } = await sql`
      UPDATE homes
      SET 
        title = ${title},
        description = ${description},
        address = ${address},
        city = ${city},
        postal_code = ${postal_code},
        bedrooms = ${bedrooms},
        bathrooms = ${bathrooms},
        max_guests = ${max_guests},
        amenities = ${JSON.stringify(amenities || currentHome.amenities)},
        images = ${JSON.stringify(images || currentHome.images)},
        updated_at = NOW()
      WHERE id = ${homeId}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating home:", error)
    return NextResponse.json({ error: "Failed to update home", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id
    const userId = session.user.id

    // Verify the user owns this home
    const { rows: homes } = await sql`
      SELECT user_id FROM homes WHERE id = ${homeId}
    `

    if (!homes || homes.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    // Convert both IDs to strings for comparison
    if (String(homes[0].user_id) !== String(userId)) {
      return NextResponse.json({ error: "Home not found or you're not the owner" }, { status: 403 })
    }

    // Delete related availabilities
    await sql`DELETE FROM availabilities WHERE home_id = ${homeId}`

    // Delete the home
    await sql`DELETE FROM homes WHERE id = ${homeId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
