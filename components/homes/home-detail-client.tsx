"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, Trash2, User, Calendar, Users, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { HomeGallery } from "@/components/homes/home-gallery"
import { HomeAmenities } from "@/components/homes/home-amenities"
import { HomeMap } from "@/components/homes/home-map"
import { HomeExchanges } from "@/components/homes/home-exchanges"
import type { Home as HomeType } from "@/lib/types"

interface HomeDetailClientProps {
  home: HomeType
  userId?: string
  isOwner: boolean
}

export function HomeDetailClient({ home, userId, isOwner }: HomeDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function deleteHome() {
    if (!isOwner) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/homes/${home.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete home")
      }

      toast({
        title: "Woning verwijderd",
        description: "Je woning is succesvol verwijderd.",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error deleting home:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de woning.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar alle woningen
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{home.title}</h1>
          <p className="text-gray-500">{home.city}, Nederland</p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/homes/${home.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijderen
            </Button>
          </div>
        )}
      </div>

      <HomeGallery images={home.images} title={home.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
              {home.owner_profile_image ? (
                <Image
                  src={home.owner_profile_image || "/placeholder.svg"}
                  alt={home.owner_name || "Eigenaar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">Aangeboden door {home.owner_name}</p>
              <p className="text-sm text-gray-500">Lid sinds {new Date(home.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">
                  {home.bedrooms} slaapkamer{home.bedrooms !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">
                  Voor {home.max_guests} gast{home.max_guests !== 1 ? "en" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Beschikbaar</p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Over deze woning</h2>
            <p>{home.description}</p>
          </div>

          <HomeAmenities amenities={home.amenities} />
          <HomeMap address={home.address} city={home.city} postalCode={home.postal_code} />
          <HomeExchanges homeId={home.id} userId={userId} />
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Geïnteresseerd in deze woning?</CardTitle>
            </CardHeader>
            <CardContent>
              {!isOwner && userId ? (
                <div className="text-center py-4">
                  <p className="mb-4">Geïnteresseerd in een huizenruil?</p>
                  <Button asChild className="w-full">
                    <Link href={`/homes/${home.id}/swap-request`}>Swap aanvragen</Link>
                  </Button>
                </div>
              ) : !userId ? (
                <div className="text-center py-4">
                  <p className="mb-4">Log in om een swap aan te vragen</p>
                  <Button asChild className="w-full">
                    <Link href="/login">Inloggen</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Dit is jouw eigen woning</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              <p>Je gegevens worden alleen gedeeld met de eigenaar van deze woning.</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Woning verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je deze woning wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={deleteHome} disabled={isDeleting}>
              {isDeleting ? "Verwijderen..." : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
