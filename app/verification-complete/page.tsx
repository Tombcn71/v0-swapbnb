"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export default function VerificationCompletePage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const router = useRouter()

  useEffect(() => {
    // Simuleer het controleren van de verificatie status
    const timer = setTimeout(() => {
      // In een echte implementatie zou je hier de status controleren via een API call
      setStatus("success")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    router.push("/profile")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === "failed" && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === "loading" && "Verificatie wordt verwerkt..."}
            {status === "success" && "Verificatie succesvol!"}
            {status === "failed" && "Verificatie mislukt"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "We controleren je identiteitsverificatie. Dit kan enkele momenten duren."}
            {status === "success" &&
              "Je identiteit is succesvol geverifieerd. Je kunt nu deelnemen aan swaps en betalingen doen."}
            {status === "failed" && "Er is een probleem opgetreden bij je identiteitsverificatie. Probeer het opnieuw."}
          </CardDescription>
        </CardHeader>
        {status !== "loading" && (
          <CardContent>
            <Button onClick={handleContinue} className="w-full">
              {status === "success" ? "Ga naar profiel" : "Probeer opnieuw"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
