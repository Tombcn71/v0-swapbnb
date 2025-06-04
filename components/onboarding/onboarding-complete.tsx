"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { PartyPopper, Search, MessageSquare, CreditCard } from "lucide-react"

export function OnboardingComplete() {
  const router = useRouter()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <PartyPopper className="h-8 w-8 text-teal-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Gefeliciteerd!</CardTitle>
        <CardDescription className="text-center">
          Je hebt alle stappen voltooid en bent klaar om te beginnen met huizenruil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <h3 className="font-medium text-teal-800 mb-2">Wat je nu kunt doen:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded-full border border-teal-200">
                <Search className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <span className="font-medium">Ontdek woningen</span>
                <p className="text-sm text-teal-700 mt-0.5">
                  Bekijk beschikbare woningen en vind je perfecte match voor een huizenruil.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded-full border border-teal-200">
                <MessageSquare className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <span className="font-medium">Stuur ruilverzoeken</span>
                <p className="text-sm text-teal-700 mt-0.5">
                  Neem contact op met andere gebruikers en plan je eerste huizenruil.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded-full border border-teal-200">
                <CreditCard className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <span className="font-medium">Gebruik je gratis credit</span>
                <p className="text-sm text-teal-700 mt-0.5">
                  Je hebt een gratis credit ontvangen om je eerste huizenruil te maken.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={() => router.push("/listings")} className="flex-1">
          Ontdek woningen
        </Button>
        <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
          Naar dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
