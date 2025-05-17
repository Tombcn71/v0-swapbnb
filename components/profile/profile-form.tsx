"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, User } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface ProfileFormProps {
  user: UserType
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [image, setImage] = useState<string | null>(user.profile_image || null) // Gebruik profile_image
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Toon een preview van de geselecteerde afbeelding
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const uploadImage = async () => {
    if (!file) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Fout bij uploaden",
        description: "Er is een fout opgetreden bij het uploaden van de afbeelding.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload de afbeelding als er een nieuwe is geselecteerd
      let imageUrl = user.profile_image // Gebruik profile_image
      if (file) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setIsSubmitting(false)
          return
        }
      }

      // Update het gebruikersprofiel
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          image: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profiel bijgewerkt",
        description: "Je profiel is succesvol bijgewerkt.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van je profiel.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bewerk je profiel</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200">
              {image ? (
                <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Label
                htmlFor="picture"
                className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <Upload className="h-4 w-4 mr-2" />
                Kies afbeelding
              </Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Je naam" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@email.nl"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
            {isSubmitting || isUploading ? "Bezig met opslaan..." : "Profiel opslaan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
