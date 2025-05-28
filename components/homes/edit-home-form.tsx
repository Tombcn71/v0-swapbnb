"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon, Loader2, Calendar, ArrowLeft } from "lucide-react"
import Image from "next/image"
// Verwijder deze regel:
// import { upload } from "@vercel/blob/client"
import { AddAvailabilityForm } from "@/components/homes/add-availability-form"

interface EditHomeFormProps {
  home: any
}

export function EditHomeForm({ home }: EditHomeFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<boolean>(false)
  const [availabilities, setAvailabilities] = useState<{ id?: string; startDate: Date; endDate: Date }[]>([])
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  console.log("EditHomeForm - Home data:", home)
  console.log("EditHomeForm - Home ID:", home.id)
  console.log("EditHomeForm - User ID:", home.userId)

  // Parse amenities if it's a string
  const initialAmenities =
    typeof home.amenities === "string"
      ? JSON.parse(home.amenities)
      : home.amenities || {
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
          pets: false,
        }

  // Parse images if it's a string
  const initialImages = typeof home.images === "string" ? JSON.parse(home.images) : home.images || []

  // Form state
  const [formData, setFormData] = useState({
    title: home.title || "",
    description: home.description || "",
    address: home.address || "",
    city: home.city || "",
    postalCode: home.postalCode || home.postal_code || "",
    bedrooms: String(home.bedrooms) || "2",
    bathrooms: String(home.bathrooms) || "1",
    maxGuests: String(home.maxGuests || home.max_guests) || "4",
    amenities: initialAmenities,
    images: initialImages,
  })

  // Fetch availabilities
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setIsLoadingAvailabilities(true)
        const response = await fetch(`/api/availabilities?homeId=${home.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch availabilities")
        }

        const data = await response.json()

        // Convert string dates to Date objects
        const formattedAvailabilities = data.map((avail: any) => ({
          id: avail.id,
          startDate: new Date(avail.startDate || avail.start_date),
          endDate: new Date(avail.endDate || avail.end_date),
        }))

        setAvailabilities(formattedAvailabilities)
      } catch (error) {
        console.error("Error fetching availabilities:", error)
        toast({
          title: "Fout bij laden",
          description: "Kon de beschikbaarheden niet laden",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAvailabilities(false)
      }
    }

    fetchAvailabilities()
  }, [home.id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked,
      },
    }))
    setHasChanges(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Maak FormData voor de upload
        const formData = new FormData()
        formData.append("file", file)

        // Upload via onze API route
        const response = await fetch("/api/upload/homes", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      }

      // Update the form state with the new images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
      setHasChanges(true)

      toast({
        title: "Foto's geüpload",
        description: `${uploadedUrls.length} foto('s) succesvol geüpload`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Fout bij uploaden",
        description:
          error instanceof Error ? error.message : "Er is een fout opgetreden bij het uploaden van de foto's",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
      // Reset the file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setHasChanges(true)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleAddAvailability = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch("/api/availabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeId: home.id,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add availability")
      }

      const newAvailability = await response.json()

      setAvailabilities((prev) => [
        ...prev,
        {
          id: newAvailability.id,
          startDate: new Date(newAvailability.startDate || newAvailability.start_date),
          endDate: new Date(newAvailability.endDate || newAvailability.end_date),
        },
      ])

      toast({
        title: "Beschikbaarheid toegevoegd",
        description: "De beschikbaarheid is succesvol toegevoegd",
      })
    } catch (error) {
      console.error("Error adding availability:", error)
      toast({
        title: "Fout bij toevoegen",
        description: error instanceof Error ? error.message : "Kon de beschikbaarheid niet toevoegen",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      const response = await fetch(`/api/availabilities/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete availability")
      }

      setAvailabilities((prev) => prev.filter((avail) => avail.id !== id))

      toast({
        title: "Beschikbaarheid verwijderd",
        description: "De beschikbaarheid is succesvol verwijderd",
      })
    } catch (error) {
      console.error("Error removing availability:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Kon de beschikbaarheid niet verwijderen",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Alleen valideren als we op het basic tabblad zijn
      if (activeTab === "basic") {
        // Validate postal code
        if (!formData.postalCode) {
          toast({
            title: "Ontbrekende postcode",
            description: "Vul een postcode in",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Alleen valideren als we op het photos tabblad zijn
      if (activeTab === "photos") {
        // Validate images
        if (formData.images.length < 3) {
          toast({
            title: "Niet genoeg foto's",
            description: "Voeg minimaal 3 foto's toe",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      console.log("Submitting form data:", {
        ...formData,
        homeId: home.id,
      })

      // Update the home
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
          postalCode: formData.postalCode,
          bedrooms: Number.parseInt(formData.bedrooms),
          bathrooms: Number.parseInt(formData.bathrooms),
          maxGuests: Number.parseInt(formData.maxGuests),
          amenities: formData.amenities,
          images: formData.images,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Error response:", responseData)
        throw new Error(responseData.error || "Er is iets misgegaan bij het bijwerken van de woning")
      }

      toast({
        title: "Woning bijgewerkt",
        description: "Je woning is succesvol bijgewerkt",
      })

      setHasChanges(false)

      // Navigate back to the home details page
      router.push(`/homes/${home.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating home:", error)
      toast({
        title: "Er is iets misgegaan",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToHome = () => {
    if (hasChanges) {
      if (confirm("Je hebt onopgeslagen wijzigingen. Weet je zeker dat je wilt teruggaan?")) {
        router.push(`/homes/${home.id}`)
      }
    } else {
      router.push(`/homes/${home.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-4">
        <Button type="button" variant="outline" onClick={handleBackToHome} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Terug naar woning
        </Button>

        {hasChanges && (
          <Button type="submit" disabled={isSubmitting} className="bg-google-blue hover:bg-blue-600">
            {isSubmitting ? "Bezig met opslaan..." : "Wijzigingen opslaan"}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basisinformatie</TabsTrigger>
          <TabsTrigger value="details">Details & Voorzieningen</TabsTrigger>
          <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
          <TabsTrigger value="photos">Foto's</TabsTrigger>
        </TabsList>

        {/* Basic information tab */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Titel van je woning</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Bijv. Gezellig appartement in Amsterdam"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Beschrijf je woning, de buurt en wat bezoekers kunnen verwachten"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Straatnaam en huisnummer"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Stad</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Bijv. Amsterdam"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postcode</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="Bijv. 1234 AB"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBackToHome}>
                    Annuleren
                  </Button>
                  <div className="space-x-2">
                    {hasChanges && (
                      <Button type="submit" disabled={isSubmitting} className="bg-google-blue hover:bg-blue-600">
                        {isSubmitting ? "Bezig met opslaan..." : "Opslaan"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className="bg-google-blue hover:bg-blue-600"
                    >
                      Volgende: Details & Voorzieningen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details & Amenities tab */}
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="bedrooms">Aantal slaapkamers</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
                      <SelectTrigger id="bedrooms" className="mt-1">
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 slaapkamer</SelectItem>
                        <SelectItem value="2">2 slaapkamers</SelectItem>
                        <SelectItem value="3">3 slaapkamers</SelectItem>
                        <SelectItem value="4">4 slaapkamers</SelectItem>
                        <SelectItem value="5">5+ slaapkamers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Aantal badkamers</Label>
                    <Select
                      value={formData.bathrooms}
                      onValueChange={(value) => handleSelectChange("bathrooms", value)}
                    >
                      <SelectTrigger id="bathrooms" className="mt-1">
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 badkamer</SelectItem>
                        <SelectItem value="2">2 badkamers</SelectItem>
                        <SelectItem value="3">3 badkamers</SelectItem>
                        <SelectItem value="4">4+ badkamers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxGuests">Maximum aantal gasten</Label>
                    <Select
                      value={formData.maxGuests}
                      onValueChange={(value) => handleSelectChange("maxGuests", value)}
                    >
                      <SelectTrigger id="maxGuests" className="mt-1">
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 gast</SelectItem>
                        <SelectItem value="2">2 gasten</SelectItem>
                        <SelectItem value="3">3 gasten</SelectItem>
                        <SelectItem value="4">4 gasten</SelectItem>
                        <SelectItem value="5">5 gasten</SelectItem>
                        <SelectItem value="6">6+ gasten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Voorzieningen</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wifi"
                        checked={formData.amenities.wifi}
                        onCheckedChange={(checked) => handleAmenityChange("wifi", checked === true)}
                      />
                      <label htmlFor="wifi" className="text-sm font-medium leading-none">
                        WiFi
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="kitchen"
                        checked={formData.amenities.kitchen}
                        onCheckedChange={(checked) => handleAmenityChange("kitchen", checked === true)}
                      />
                      <label htmlFor="kitchen" className="text-sm font-medium leading-none">
                        Keuken
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="heating"
                        checked={formData.amenities.heating}
                        onCheckedChange={(checked) => handleAmenityChange("heating", checked === true)}
                      />
                      <label htmlFor="heating" className="text-sm font-medium leading-none">
                        Verwarming
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tv"
                        checked={formData.amenities.tv}
                        onCheckedChange={(checked) => handleAmenityChange("tv", checked === true)}
                      />
                      <label htmlFor="tv" className="text-sm font-medium leading-none">
                        TV
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="washer"
                        checked={formData.amenities.washer}
                        onCheckedChange={(checked) => handleAmenityChange("washer", checked === true)}
                      />
                      <label htmlFor="washer" className="text-sm font-medium leading-none">
                        Wasmachine
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dryer"
                        checked={formData.amenities.dryer}
                        onCheckedChange={(checked) => handleAmenityChange("dryer", checked === true)}
                      />
                      <label htmlFor="dryer" className="text-sm font-medium leading-none">
                        Droger
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="airconditioning"
                        checked={formData.amenities.airconditioning}
                        onCheckedChange={(checked) => handleAmenityChange("airconditioning", checked === true)}
                      />
                      <label htmlFor="airconditioning" className="text-sm font-medium leading-none">
                        Airconditioning
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parking"
                        checked={formData.amenities.parking}
                        onCheckedChange={(checked) => handleAmenityChange("parking", checked === true)}
                      />
                      <label htmlFor="parking" className="text-sm font-medium leading-none">
                        Parkeerplaats
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="elevator"
                        checked={formData.amenities.elevator}
                        onCheckedChange={(checked) => handleAmenityChange("elevator", checked === true)}
                      />
                      <label htmlFor="elevator" className="text-sm font-medium leading-none">
                        Lift
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garden"
                        checked={formData.amenities.garden}
                        onCheckedChange={(checked) => handleAmenityChange("garden", checked === true)}
                      />
                      <label htmlFor="garden" className="text-sm font-medium leading-none">
                        Tuin
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bbq"
                        checked={formData.amenities.bbq}
                        onCheckedChange={(checked) => handleAmenityChange("bbq", checked === true)}
                      />
                      <label htmlFor="bbq" className="text-sm font-medium leading-none">
                        BBQ
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pets"
                        checked={formData.amenities.pets}
                        onCheckedChange={(checked) => handleAmenityChange("pets", checked === true)}
                      />
                      <label htmlFor="pets" className="text-sm font-medium leading-none">
                        Huisdieren toegestaan
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                    Terug: Basisinformatie
                  </Button>
                  <div className="space-x-2">
                    {hasChanges && (
                      <Button type="submit" disabled={isSubmitting} className="bg-google-blue hover:bg-blue-600">
                        {isSubmitting ? "Bezig met opslaan..." : "Opslaan"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => setActiveTab("availability")}
                      className="bg-google-blue hover:bg-blue-600"
                    >
                      Volgende: Beschikbaarheid
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability tab */}
        <TabsContent value="availability">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Beschikbaarheid beheren</h2>
                  <p className="text-gray-600 mb-4">
                    Beheer wanneer je woning beschikbaar is voor huizenswap. Je kunt meerdere periodes toevoegen.
                  </p>

                  <div className="space-y-4">
                    {isLoadingAvailabilities ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      </div>
                    ) : availabilities.length > 0 ? (
                      <div className="mb-4">
                        <h3 className="text-md font-medium mb-2">Huidige beschikbaarheid:</h3>
                        <div className="space-y-2">
                          {availabilities.map((availability) => (
                            <div
                              key={availability.id}
                              className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50"
                            >
                              <div className="flex-grow">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                                  <p className="font-medium">
                                    {availability.startDate.toLocaleDateString("nl-NL")} tot{" "}
                                    {availability.endDate.toLocaleDateString("nl-NL")}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => availability.id && handleRemoveAvailability(availability.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <p className="text-yellow-800">
                          Je hebt nog geen beschikbaarheid toegevoegd. Voeg minimaal één periode toe.
                        </p>
                      </div>
                    )}

                    <AddAvailabilityForm onAdd={handleAddAvailability} />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    Terug: Details & Voorzieningen
                  </Button>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToHome}>
                      Terug naar woning
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("photos")}
                      className="bg-google-blue hover:bg-blue-600"
                    >
                      Volgende: Foto's
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos tab */}
        <TabsContent value="photos">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Foto's van je woning</Label>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  {/* Photo upload area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Upload button */}
                    <div
                      onClick={triggerFileInput}
                      className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center h-40">
                        {uploadingImages ? (
                          <Loader2 className="h-10 w-10 text-gray-400 mb-2 animate-spin" />
                        ) : (
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        )}
                        <p className="text-sm text-gray-600">
                          {uploadingImages ? "Bezig met uploaden..." : "Klik om foto's te uploaden"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">(of sleep bestanden hierheen)</p>
                      </div>
                    </div>

                    {/* Uploaded photos */}
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden h-40">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Woning foto ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          aria-label="Verwijder foto"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* Placeholder slots for additional photos */}
                    {formData.images.length > 0 && formData.images.length < 5 && (
                      <div
                        onClick={triggerFileInput}
                        className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center h-40">
                          <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Voeg meer foto's toe</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Upload minimaal 3 foto's van je woning. Zorg voor een foto van de buitenkant, woonkamer en
                    slaapkamer.
                  </p>

                  {formData.images.length < 3 && (
                    <p className="text-sm text-red-500 mt-1">
                      Je moet nog {3 - formData.images.length} foto('s) uploaden.
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("availability")}>
                    Terug: Beschikbaarheid
                  </Button>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToHome}>
                      Terug naar woning
                    </Button>
                    {hasChanges && (
                      <Button
                        type="submit"
                        disabled={isSubmitting || formData.images.length < 3}
                        className="bg-google-blue hover:bg-blue-600"
                      >
                        {isSubmitting ? "Bezig met opslaan..." : "Wijzigingen opslaan"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
