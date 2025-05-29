"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Inloggen mislukt. Controleer je e-mailadres en wachtwoord.")
        return
      }

      // Redirect to dashboard after successful login
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("Inloggen mislukt. Controleer je e-mailadres en wachtwoord.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center">
            <Home className="h-6 w-6 text-teal-500 mr-2" />
            <span className="text-xl font-bold text-teal-500">SwapBnB</span>
          </Link>
        </div>
        <CardTitle className="text-2xl text-center">Inloggen</CardTitle>
        <CardDescription className="text-center">Vul je gegevens in om in te loggen op je account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Wachtwoord</Label>
              <Link href="/forgot-password" className="text-sm text-teal-500 hover:text-teal-600">
                Wachtwoord vergeten?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
            {isLoading ? "Bezig met inloggen..." : "Inloggen"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Of log in met testgebruiker</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEmail("jan.devries@example.com")
              setPassword("password123")
            }}
            type="button"
          >
            Jan de Vries
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEmail("emma.bakker@example.com")
              setPassword("password123")
            }}
            type="button"
          >
            Emma Bakker
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          <span>Nog geen account? </span>
          <Link href="/signup" className="text-teal-500 hover:text-teal-600 font-medium">
            Registreren
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
