import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardExchanges } from "@/components/dashboard/dashboard-exchanges"
import { MessageSquare, User, Plus } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userName = session.user.name || "gebruiker"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welkom {userName}!</h1>
      <p className="text-gray-600 mb-6">Beheer je woningen, uitwisselingen en berichten op één plek.</p>

      <DashboardNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mijn Woning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Je hebt nog geen woning toegevoegd</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/homes/new">
                <Plus className="mr-2 h-4 w-4" />
                Voeg woning toe
              </Link>
            </Button>
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

      <h2 className="text-2xl font-bold mb-4">Aankomende Uitwisselingen</h2>
      <DashboardExchanges />
    </div>
  )
}
