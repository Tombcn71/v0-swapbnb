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
    const { rows } = await sql`
      SELECT 
        h.id, 
        h.title, 
        h.description, 
        h.address, 
        h.image_url as "imageUrl", 
        h.bedrooms, 
        h.bathrooms, 
        h.max_guests as "maxGuests", 
        h.price_per_night as "pricePerNight", 
        h.user_id as "userId"
      FROM homes h
      WHERE h.id = ${params.id}
    `

    if (rows.length === 0) {
      return notFound()
    }

    const home = rows[0]

    // Check if the current user is the owner of the home
    if (home.userId !== session.user.id) {
      redirect("/")
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <EditHomeForm home={home} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
