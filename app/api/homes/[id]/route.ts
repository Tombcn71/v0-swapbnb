import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

// Directe database verbinding
const db = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Log de params ID voor debugging
    console.log("API GET home - params.id:", params.id)

    // Gebruik directe query met prepared statement
    const homes = await db.query(
      `SELECT h.*, u.name as host_name, u.profile_image as host_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [params.id],
    )

    if (homes.length === 0) {
      // Probeer een directe query met string
      console.log(`Home not found with ID ${params.id}, trying direct query...`)

      const directHomes = await db.query(
        `SELECT h.*, u.name as host_name, u.profile_image as host_profile_image
         FROM homes h
         JOIN users u ON h.user_id = u.id
         WHERE h.id = '${params.id}'`,
      )

      if (directHomes.length === 0) {
        console.log("API - No home found with ID:", params.id)
        return NextResponse.json({ error: "Home not found" }, { status: 404 })
      }

      console.log("API - Home found with direct query:", directHomes[0].id)
      return NextResponse.json(directHomes[0])
    }

    const home = homes[0]

    // Log de home data voor debugging
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
    const homes = await db.query(`SELECT * FROM homes WHERE id = $1`, [homeId])

    if (homes.length === 0) {
      // Probeer een directe query met string
      console.log(`Home not found with ID ${homeId}, trying direct query...`)

      const directHomes = await db.query(`SELECT * FROM homes WHERE id = '${homeId}'`)

      if (directHomes.length === 0) {
        return NextResponse.json({ error: "Home not found" }, { status: 404 })
      }

      console.log(`Found home with direct query: ${JSON.stringify(directHomes[0])}`)

      // Gebruik het resultaat van de directe query
      if (directHomes[0].user_id !== userId) {
        return NextResponse.json({ error: "Home not found or you're not the owner" }, { status: 403 })
      }

      // Update de home met de directe query methode
      const {
        title = directHomes[0].title,
        description = directHomes[0].description,
        address = directHomes[0].address,
        city = directHomes[0].city,
        postalCode,
        bedrooms = directHomes[0].bedrooms,
        bathrooms = directHomes[0].bathrooms,
        maxGuests,
        amenities,
        images,
      } = await request.json()

      // Ensure postal_code is not null by using the current value as fallback
      const postal_code = postalCode || directHomes[0].postal_code

      // Ensure max_guests is not null by using the current value as fallback
      const max_guests = maxGuests || directHomes[0].max_guests

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
      const result = await db.query(
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
          JSON.stringify(amenities || directHomes[0].amenities),
          JSON.stringify(images || directHomes[0].images),
          homeId,
        ],
      )

      if (result.length === 0) {
        return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
      }

      return NextResponse.json(result[0])
    }

    console.log("Home owner ID:", homes[0].user_id)
    console.log("Are IDs equal?", homes[0].user_id === userId)
    console.log("Home owner ID type:", typeof homes[0].user_id)
    console.log("Session user ID type:", typeof userId)

    // Convert both IDs to strings for comparison
    if (homes[0].user_id !== userId) {
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
    const result = await db.query(
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

    if (result.length === 0) {
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
    const homes = await db.query(`SELECT user_id FROM homes WHERE id = $1`, [homeId])

    if (homes.length === 0) {
      // Probeer een directe query met string
      const directHomes = await db.query(`SELECT user_id FROM homes WHERE id = '${homeId}'`)

      if (directHomes.length === 0) {
        return NextResponse.json({ error: "Home not found" }, { status: 404 })
      }

      // Gebruik het resultaat van de directe query
      if (directHomes[0].user_id !== userId) {
        return NextResponse.json({ error: "Home not found or you're not the owner" }, { status: 403 })
      }

      // Delete related availabilities
      await db.query(`DELETE FROM availabilities WHERE home_id = $1`, [homeId])

      // Delete the home
      await db.query(`DELETE FROM homes WHERE id = $1`, [homeId])

      return NextResponse.json({ success: true })
    }

    // Convert both IDs to strings for comparison
    if (homes[0].user_id !== userId) {
      return NextResponse.json({ error: "Home not found or you're not the owner" }, { status: 403 })
    }

    // Delete related availabilities
    await db.query(`DELETE FROM availabilities WHERE home_id = $1`, [homeId])

    // Delete the home
    await db.query(`DELETE FROM homes WHERE id = $1`, [homeId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
