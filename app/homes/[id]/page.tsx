import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import type { Home as HomeType } from "@/lib/types"

interface HomePageProps {
  params: {
    id: string
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const session = await getServerSession(authOptions)

  try {
    const homes = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.email as owner_email, u.image as owner_image
       FROM homes h 
       JOIN users u ON h.user_id = u.id 
       WHERE h.id = $1`,
      [params.id],
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
