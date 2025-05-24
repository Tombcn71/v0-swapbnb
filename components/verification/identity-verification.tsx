"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, ShieldCheck, ShieldX, AlertCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface IdentityVerificationProps {
  verificationStatus: string
  onVerificationComplete?: () => void
}

export function IdentityVerification({ verificationStatus, onVerificationComplete }: IdentityVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleStartVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/verification/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start verification")
      }

      const { client_secret } = await response.json()
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error } = await stripe.verifyIdentity(client_secret)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Verificatie gestart",
        description: "Je identiteitsverificatie is gestart. Je wordt doorgestuurd naar Stripe.",
      })

      if (onVerificationComplete) {
        onVerificationComplete()
      }
    } catch (error: any) {
      toast({
        title: "Verificatie mislukt",
        description: error.message || "Er is een fout opgetreden bij het starten van de verificatie.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "verified":
        return <ShieldCheck className="h-6 w-6 text-green-500" />
      case "pending":
        return <Shield className="h-6 w-6 text-yellow-500" />
      case "failed":
        return <ShieldX className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Geverifieerd</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">In behandeling</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Mislukt</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Niet geverifieerd</Badge>
    }
  }

  const getDescription = () => {
    switch (verificationStatus) {
      case "verified":
        return "Je identiteit is succesvol geverifieerd. Je kunt nu betalingen doen voor swaps."
      case "pending":
        return "Je identiteitsverificatie wordt momenteel verwerkt. Dit kan enkele minuten duren."
      case "failed":
        return "Je identiteitsverificatie is mislukt. Probeer het opnieuw met een geldig identiteitsbewijs."
      default:
        return "Verifieer je identiteit om betalingen te kunnen doen en deel te nemen aan swaps."
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <CardTitle>Identiteitsverificatie</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {verificationStatus === "unverified" && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Wat heb je nodig?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Een geldig identiteitsbewijs (paspoort, rijbewijs, of ID-kaart)</li>
                <li>• Een goed verlichte ruimte voor duidelijke foto's</li>
                <li>• Ongeveer 2-3 minuten van je tijd</li>
              </ul>
            </div>
            <Button onClick={handleStartVerification} disabled={isLoading} className="w-full">
              {isLoading ? "Verificatie starten..." : "Start identiteitsverificatie"}
            </Button>
          </div>
        )}

        {verificationStatus === "failed" && (
          <Button onClick={handleStartVerification} disabled={isLoading} className="w-full">
            {isLoading ? "Verificatie starten..." : "Probeer opnieuw"}
          </Button>
        )}

        {verificationStatus === "pending" && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Verificatie wordt verwerkt...</p>
          </div>
        )}

        {verificationStatus === "verified" && (
          <div className="text-center py-4">
            <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Je identiteit is geverifieerd!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
