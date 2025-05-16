import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    const { rows } = await sql`
      SELECT 
        h.id, 
        h.title, 
        h.description, 
        h.address, 
        h.images, 
        h.bedrooms, 
        h.bathrooms, 
        h.max_guests as "maxGuests", 
        h.user_id as "userId",
        u.name as "ownerName",
        u.email as "ownerEmail"
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ${params.id}
    `

    if (rows.length === 0) {
      return notFound()
    }

    // Process the home data to ensure it has the expected format
    const home = {
      ...rows[0],
      // If images is stored as a JSON string, parse it
      // If it's already an array, use it as is
      // If it's null/undefined, provide an empty array
      images: typeof rows[0].images === "string" ? JSON.parse(rows[0].images) : rows[0].images || [],
    }

    const isOwner = userId === home.userId

    return <HomeDetailClient home={home} isOwner={isOwner} />
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
