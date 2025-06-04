"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { useToast } from "@/hooks/use-toast"

export function OnboardingProfile() {
  const { data: session } = useSession()
  const { completeStep } = useOnboarding()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Failed to fetch user data")

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Fout bij laden",
          description: "Kon je profielgegevens niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchUserData()
    }
  }, [session, toast])

  const handleProfileComplete = () => {
    completeStep("profile")
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Profiel aanmaken</CardTitle>
          <CardDescription>Laden...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Maak je profiel compleet</CardTitle>
        <CardDescription>
          Vul je profielgegevens in zodat andere gebruikers je kunnen leren kennen. Een volledig profiel verhoogt je
          kansen op succesvolle huizenruil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user && <ProfileForm user={user} onComplete={handleProfileComplete} isOnboarding={true} />}
      </CardContent>
    </Card>
  )
}
