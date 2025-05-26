import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import type { Home as HomeType } from "@/lib/types"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const homeId = params.id

  try {
    const homes = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.email as owner_email, u.image as owner_image
       FROM homes h 
       JOIN users u ON h.user_id = u.id 
       WHERE h.id = $1`,
      [homeId],
    )

    if (homes.length === 0) {
      notFound()
    }

    const home = homes[0] as HomeType & {
      owner_name: string
      owner_email: string
      owner_image: string | null
    }

    return <HomeDetailClient home={home} session={session} />
  } catch (error) {
    console.error("Error fetching home:", error)
    notFound()
  }
}
