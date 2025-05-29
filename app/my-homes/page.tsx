import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Plus, Home, MapPin } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import type { Home as HomeType } from "@/lib/types"

export default async function MyHomesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Haal de woning van de gebruiker op
  const userHomes = await executeQuery(
    `SELECT h.*, u.name as owner_name 
    FROM homes h 
    JOIN users u ON h.user_id = u.id 
    WHERE h.user_id = $1 
    LIMIT 1`,
    [session.user.id],
  )

  const userHome = userHomes.length > 0 ? (userHomes[0] as HomeType) : null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mijn Woning</h1>

      <div className="max-w-md">
        <Card>
          <CardContent className="p-0">
            {userHome ? (
              <div className="space-y-0">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      userHome.images && Array.isArray(userHome.images) && userHome.images.length > 0
                        ? userHome.images[0]
                        : `/placeholder.svg?height=400&width=600&query=${userHome.title}`
                    }
                    alt={userHome.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-semibold">{userHome.title}</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{userHome.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Home className="h-4 w-4 mr-2" />
                    <span>
                      {userHome.bedrooms} slaapkamer{userHome.bedrooms !== 1 && "s"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Je hebt nog geen woning toegevoegd</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {userHome ? (
              <Button variant="outline" asChild className="w-full">
                <Link href={`/homes/${userHome.id}/edit`}>Bewerk woning</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/homes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Voeg woning toe
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
