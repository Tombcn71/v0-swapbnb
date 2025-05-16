import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const home = await executeQuery(
      `SELECT h.*, u.name as host_name
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [params.id],
    )

    if (home.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    return NextResponse.json(home[0])
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id
    const body = await request.json()

    // Verify the user owns this home
    const homes = await executeQuery("SELECT * FROM homes WHERE id = $1", [homeId])

    if (!homes || homes.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    if (homes[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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
    } = body

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

    const result = await executeQuery(
      `UPDATE homes
       SET 
         title = $1,
         description = $2,
         address = $3,
         city = $4,
         postal_code = $5,
         bedrooms = $6,
         bathrooms = $7,
         max_guests = $8,
         amenities = $9,
         images = $10,
         updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        title,
        description,
        address,
        city,
        postal_code,
        bedrooms,
        bathrooms,
        max_guests,
        JSON.stringify(amenities || currentHome.amenities),
        JSON.stringify(images || currentHome.images),
        homeId,
      ],
    )

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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id

    // Verify the user owns this home
    const homes = await executeQuery("SELECT user_id FROM homes WHERE id = $1", [homeId])

    if (!homes || homes.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    if (homes[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete related availabilities
    await executeQuery("DELETE FROM availabilities WHERE home_id = $1", [homeId])

    // Delete the home
    await executeQuery("DELETE FROM homes WHERE id = $1", [homeId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
