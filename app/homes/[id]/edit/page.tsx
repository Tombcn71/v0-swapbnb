import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { EditHomeForm } from "@/components/homes/edit-home-form"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function EditHomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  try {
    console.log("Edit page - Home ID:", params.id)
    console.log("Edit page - User ID:", session.user.id)

    // Use sql template literal instead of executeQuery
    const { rows: homes } = await sql`
      SELECT 
        h.id, 
        h.title, 
        h.description, 
        h.address,
        h.city,
        h.postal_code as "postalCode",
        h.images, 
        h.bedrooms, 
        h.bathrooms, 
        h.max_guests as "maxGuests",
        h.amenities,
        h.user_id as "userId"
      FROM homes h
      WHERE h.id = ${params.id}
    `

    if (!homes || homes.length === 0) {
      return notFound()
    }

    const home = homes[0]

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...home,
      // Parse the images JSON if it's a string
      images: typeof home.images === "string" ? JSON.parse(home.images) : home.images || [],
      // Parse the amenities JSON if it's a string
      amenities: typeof home.amenities === "string" ? JSON.parse(home.amenities) : home.amenities || {},
    }

    console.log("Edit page - Home owner ID:", processedHome.userId)
    console.log("Edit page - Are IDs equal?", processedHome.userId === session.user.id)
    console.log("Edit page - Home owner ID type:", typeof processedHome.userId)
    console.log("Edit page - Session user ID type:", typeof session.user.id)

    // Convert both IDs to strings for comparison
    if (String(processedHome.userId) !== String(session.user.id)) {
      console.log("Edit page - User is not the owner, redirecting")
      redirect("/")
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Woning bewerken</h1>
        <EditHomeForm home={processedHome} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
