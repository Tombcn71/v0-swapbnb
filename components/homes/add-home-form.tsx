"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
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
import { Upload, Check } from "lucide-react"

export function AddHomeForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Formulier state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    bedrooms: "2",
    bathrooms: "1",
    maxGuests: "4",
    amenities: {
      wifi: true,
      kitchen: true,
      heating: true,
      tv: true,
      washer: false,
      dryer: false,
      airconditioning: false,
      parking: false,
      elevator: false,
      garden: false,
      bbq: false,
      pets: false,
    },
    images: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Submitting home data:", formData)

      const response = await fetch("/api/homes", {
        method: "POST",
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

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Er is iets misgegaan bij het toevoegen van de woning")
      }

      const data = await response.json()
      console.log("Home added successfully:", data)

      toast({
        title: "Woning toegevoegd",
        description: "Je woning is succesvol toegevoegd aan SwapBnB",
      })

      // Navigeer naar de dashboard pagina
      router.push("/listings")
      router.refresh()
    } catch (error) {
      console.error("Error adding home:", error)
      toast({
        title: "Er is iets misgegaan",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? "bg-teal-500 text-white" : "bg-gray-200"
              } mr-3`}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <span className="font-medium">Basisinformatie</span>
          </div>
          <div className="hidden sm:block w-24 h-0.5 bg-gray-200"></div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? "bg-teal-500 text-white" : "bg-gray-200"
              } mr-3`}
            >
              {step > 2 ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <span className="font-medium">Details & Voorzieningen</span>
          </div>
          <div className="hidden sm:block w-24 h-0.5 bg-gray-200"></div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? "bg-teal-500 text-white" : "bg-gray-200"
              } mr-3`}
            >
              {step > 3 ? <Check className="h-5 w-5" /> : "3"}
            </div>
            <span className="font-medium">Foto's & Bevestiging</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
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

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Volgende stap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
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
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Vorige stap
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Volgende stap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Foto's van je woning</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex flex-col items-center justify-center h-40">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Klik om een foto te uploaden</p>
                        <p className="text-xs text-gray-500 mt-1">(of sleep een bestand hierheen)</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex flex-col items-center justify-center h-40">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Klik om een foto te uploaden</p>
                        <p className="text-xs text-gray-500 mt-1">(of sleep een bestand hierheen)</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex flex-col items-center justify-center h-40">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Klik om een foto te uploaden</p>
                        <p className="text-xs text-gray-500 mt-1">(of sleep een bestand hierheen)</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload minimaal 3 foto's van je woning. Zorg voor een foto van de buitenkant, woonkamer en
                    slaapkamer.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Controleer je gegevens</h3>
                  <Tabs defaultValue="basic">
                    <TabsList>
                      <TabsTrigger value="basic">Basisinformatie</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Titel</p>
                          <p>{formData.title || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Locatie</p>
                          <p>{formData.city || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Adres</p>
                          <p>{formData.address || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Postcode</p>
                          <p>{formData.postalCode || "-"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Beschrijving</p>
                        <p className="text-sm">{formData.description || "-"}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Slaapkamers</p>
                          <p>{formData.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Badkamers</p>
                          <p>{formData.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Max. gasten</p>
                          <p>{formData.maxGuests}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Voorzieningen</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(formData.amenities)
                            .filter(([_, value]) => value)
                            .map(([key]) => (
                              <Badge key={key} variant="outline">
                                {key === "wifi"
                                  ? "WiFi"
                                  : key === "kitchen"
                                    ? "Keuken"
                                    : key === "heating"
                                      ? "Verwarming"
                                      : key === "tv"
                                        ? "TV"
                                        : key === "washer"
                                          ? "Wasmachine"
                                          : key === "dryer"
                                            ? "Droger"
                                            : key === "airconditioning"
                                              ? "Airconditioning"
                                              : key === "parking"
                                                ? "Parkeerplaats"
                                                : key === "elevator"
                                                  ? "Lift"
                                                  : key === "garden"
                                                    ? "Tuin"
                                                    : key === "bbq"
                                                      ? "BBQ"
                                                      : "Huisdieren toegestaan"}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Vorige stap
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Bezig met opslaan..." : "Woning toevoegen"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
