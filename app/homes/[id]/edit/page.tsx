import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { EditHomeForm } from "@/components/homes/edit-home-form"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export default async function EditHomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  try {
    // Use executeQuery to maintain consistency with other parts of the app
    const homes = await executeQuery(
      `SELECT 
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
      WHERE h.id = $1`,
      [params.id],
    )

    if (!homes || homes.length === 0) {
      return notFound()
    }

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...homes[0],
      // Parse the images JSON if it's a string
      images: typeof homes[0].images === "string" ? JSON.parse(homes[0].images) : homes[0].images || [],
      // Parse the amenities JSON if it's a string
      amenities: typeof homes[0].amenities === "string" ? JSON.parse(homes[0].amenities) : homes[0].amenities || {},
    }

    // Convert both IDs to strings for comparison
    if (String(processedHome.userId) !== String(session.user.id)) {
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
