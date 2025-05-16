"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddAvailabilityForm } from "@/components/homes/add-availability-form"
import { HomeAvailability } from "@/components/homes/home-availability"
import type { Home } from "@/lib/types"
import { X, Upload } from "lucide-react"
import Image from "next/image"

interface EditHomeFormProps {
  home: Home
}

export function EditHomeForm({ home }: EditHomeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: home.title || "",
    description: home.description || "",
    address: home.address || "",
    city: home.city || "",
    postalCode: home.postalCode || home.postal_code || "",
    bedrooms: home.bedrooms || 1,
    bathrooms: home.bathrooms || 1,
    maxGuests: home.maxGuests || home.max_guests || 1,
    amenities: home.amenities || {
      wifi: false,
      kitchen: false,
      heating: false,
      tv: false,
      washer: false,
      dryer: false,
      airconditioning: false,
      parking: false,
      elevator: false,
      garden: false,
      bbq: false,
      petsAllowed: false,
    },
    images: Array.isArray(home.images) ? [...home.images] : [],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
  }

  const handleAmenityChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked,
      },
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
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
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))

      toast({
        title: "Afbeeldingen geüpload",
        description: `${uploadedUrls.length} afbeelding(en) succesvol geüpload`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Fout bij uploaden",
        description: "Er is een fout opgetreden bij het uploaden van de afbeeldingen",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.images.length < 3) {
      toast({
        title: "Niet genoeg afbeeldingen",
        description: "Voeg minimaal 3 afbeeldingen toe van je woning",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/homes/${home.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          max_guests: formData.maxGuests,
          amenities: formData.amenities,
          images: formData.images,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update home")
      }

      toast({
        title: "Woning bijgewerkt",
        description: "Je woning is succesvol bijgewerkt",
      })

      router.push(`/homes/${home.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating home:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de woning",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("details")
    else if (activeTab === "details") setActiveTab("availability")
    else if (activeTab === "availability") setActiveTab("photos")
  }

  const prevTab = () => {
    if (activeTab === "photos") setActiveTab("availability")
    else if (activeTab === "availability") setActiveTab("details")
    else if (activeTab === "details") setActiveTab("basic")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="basic">Basisinformatie</TabsTrigger>
          <TabsTrigger value="details">Details & Voorzieningen</TabsTrigger>
          <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
          <TabsTrigger value="photos">Foto's</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Geef je woning een titel"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Beschrijf je woning"
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Straat en huisnummer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Plaats</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Plaats"
                  required
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postcode</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postcode"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="button" onClick={nextTab}>
                Volgende
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Aantal slaapkamers</Label>
                <Select
                  value={formData.bedrooms.toString()}
                  onValueChange={(value) => handleSelectChange("bedrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer aantal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bathrooms">Aantal badkamers</Label>
                <Select
                  value={formData.bathrooms.toString()}
                  onValueChange={(value) => handleSelectChange("bathrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer aantal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxGuests">Maximum aantal gasten</Label>
                <Select
                  value={formData.maxGuests.toString()}
                  onValueChange={(value) => handleSelectChange("maxGuests", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer aantal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Voorzieningen</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wifi"
                    checked={formData.amenities.wifi}
                    onCheckedChange={(checked) => handleAmenityChange("wifi", checked as boolean)}
                  />
                  <Label htmlFor="wifi">WiFi</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kitchen"
                    checked={formData.amenities.kitchen}
                    onCheckedChange={(checked) => handleAmenityChange("kitchen", checked as boolean)}
                  />
                  <Label htmlFor="kitchen">Keuken</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="heating"
                    checked={formData.amenities.heating}
                    onCheckedChange={(checked) => handleAmenityChange("heating", checked as boolean)}
                  />
                  <Label htmlFor="heating">Verwarming</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tv"
                    checked={formData.amenities.tv}
                    onCheckedChange={(checked) => handleAmenityChange("tv", checked as boolean)}
                  />
                  <Label htmlFor="tv">TV</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="washer"
                    checked={formData.amenities.washer}
                    onCheckedChange={(checked) => handleAmenityChange("washer", checked as boolean)}
                  />
                  <Label htmlFor="washer">Wasmachine</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dryer"
                    checked={formData.amenities.dryer}
                    onCheckedChange={(checked) => handleAmenityChange("dryer", checked as boolean)}
                  />
                  <Label htmlFor="dryer">Droger</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airconditioning"
                    checked={formData.amenities.airconditioning}
                    onCheckedChange={(checked) => handleAmenityChange("airconditioning", checked as boolean)}
                  />
                  <Label htmlFor="airconditioning">Airconditioning</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={formData.amenities.parking}
                    onCheckedChange={(checked) => handleAmenityChange("parking", checked as boolean)}
                  />
                  <Label htmlFor="parking">Parkeren</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="elevator"
                    checked={formData.amenities.elevator}
                    onCheckedChange={(checked) => handleAmenityChange("elevator", checked as boolean)}
                  />
                  <Label htmlFor="elevator">Lift</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="garden"
                    checked={formData.amenities.garden}
                    onCheckedChange={(checked) => handleAmenityChange("garden", checked as boolean)}
                  />
                  <Label htmlFor="garden">Tuin</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bbq"
                    checked={formData.amenities.bbq}
                    onCheckedChange={(checked) => handleAmenityChange("bbq", checked as boolean)}
                  />
                  <Label htmlFor="bbq">BBQ</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petsAllowed"
                    checked={formData.amenities.petsAllowed}
                    onCheckedChange={(checked) => handleAmenityChange("petsAllowed", checked as boolean)}
                  />
                  <Label htmlFor="petsAllowed">Huisdieren toegestaan</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevTab}>
                Terug
              </Button>
              <Button type="button" onClick={nextTab}>
                Volgende
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Beschikbaarheid</h3>
              <p className="text-gray-600 mb-4">Geef aan wanneer je woning beschikbaar is voor uitwisseling.</p>

              <div className="mb-6">
                <HomeAvailability homeId={home.id} isOwner={true} />
              </div>

              <div className="mt-8">
                <h4 className="font-medium mb-2">Nieuwe beschikbaarheid toevoegen</h4>
                <AddAvailabilityForm homeId={home.id} onSuccess={() => router.refresh()} />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevTab}>
                Terug
              </Button>
              <Button type="button" onClick={nextTab}>
                Volgende
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Foto's</h3>
              <p className="text-gray-600 mb-4">
                Upload minimaal 3 foto's van je woning. De eerste foto wordt gebruikt als hoofdafbeelding.
              </p>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative h-40 rounded-lg overflow-hidden group">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Woning foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Verwijder foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                          Hoofdafbeelding
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="images" className="sr-only">
                  Foto's uploaden
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/80"
                    >
                      <span>Upload foto's</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF tot 10MB</p>
                  </div>
                  {uploadingImages && <p className="mt-2 text-sm text-gray-500">Bezig met uploaden...</p>}
                </div>
              </div>

              {formData.images.length < 3 && (
                <p className="text-amber-600 mt-2">
                  Nog {3 - formData.images.length} foto's nodig (minimaal 3 vereist)
                </p>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevTab}>
                Terug
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || formData.images.length < 3}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Bezig met opslaan..." : "Wijzigingen opslaan"}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
