import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardExchanges } from "@/components/dashboard/dashboard-exchanges"
import { DashboardFavorites } from "@/components/dashboard/dashboard-favorites"
import { MessageSquare, User, Plus, Home, MapPin } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import type { Home as HomeType } from "@/lib/types"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userName = session.user.name || "gebruiker"

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
      <h1 className="text-3xl font-bold mb-2">Welkom {userName}!</h1>
      <p className="text-gray-600 mb-6">Beheer je woning, uitwisselingen en berichten op één plek.</p>

      <DashboardNav currentPage="dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mijn Woning</CardTitle>
          </CardHeader>
          <CardContent>
            {userHome ? (
              <div className="space-y-3">
                <div className="relative h-32 w-full overflow-hidden rounded-md">
                  <Image
                    src={
                      userHome.images && Array.isArray(userHome.images) && userHome.images.length > 0
                        ? userHome.images[0]
                        : `/abstract-geometric-shapes.png?height=400&width=600&query=${userHome.title}`
                    }
                    alt={userHome.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium">{userHome.title}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{userHome.city}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Home className="h-3 w-3 mr-1" />
                  <span>
                    {userHome.bedrooms} slaapkamer{userHome.bedrooms !== 1 && "s"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Je hebt nog geen woning toegevoegd</p>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Berichten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Je hebt geen ongelezen berichten</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Bekijk berichten
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mijn Profiel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Beheer je profielgegevens</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Bewerk profiel
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Favoriete Woningen</h2>
      <DashboardFavorites />

      <h2 className="text-2xl font-bold mt-8 mb-4">Aankomende Uitwisselingen</h2>
      <DashboardExchanges />
    </div>
  )
}
