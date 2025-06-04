"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Search, Home, MessageSquare } from "lucide-react"

export function OnboardingComplete() {
  const router = useRouter()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-teal-500" />
        </div>
        <CardTitle className="text-2xl text-center">Gefeliciteerd!</CardTitle>
        <CardDescription className="text-center">
          Je bent nu klaar om te beginnen met huizenruil op SwapBnB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <p className="text-teal-800 text-center">
            Je hebt een gratis credit ontvangen om je eerste huizenruil te maken.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-center">Wat kun je nu doen?</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center">
              <Search className="h-8 w-8 text-teal-500 mb-2" />
              <h4 className="font-medium">Ontdek woningen</h4>
              <p className="text-sm text-gray-600 mt-1">Bekijk beschikbare woningen en vind je perfecte match.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center">
              <Home className="h-8 w-8 text-teal-500 mb-2" />
              <h4 className="font-medium">Beheer je woning</h4>
              <p className="text-sm text-gray-600 mt-1">Voeg beschikbaarheid toe en beheer je woningdetails.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 text-teal-500 mb-2" />
              <h4 className="font-medium">Start gesprekken</h4>
              <p className="text-sm text-gray-600 mt-1">
                Neem contact op met andere gebruikers over potentiële ruilen.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={() => router.push("/listings")} className="w-full">
          Ontdek woningen
        </Button>
        <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
          Ga naar dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
