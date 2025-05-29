"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Er is iets misgegaan!</h2>
      <p className="mb-6 text-gray-600 max-w-md">
        Er is een fout opgetreden bij het laden van de pagina. Probeer het opnieuw of ga terug naar de homepagina.
      </p>
      {error.digest && <p className="text-sm text-gray-500 mb-6">Foutcode: {error.digest}</p>}
      <div className="flex gap-4">
        <Button onClick={reset}>Probeer opnieuw</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Ga naar homepagina
        </Button>
      </div>
    </div>
  )
}
