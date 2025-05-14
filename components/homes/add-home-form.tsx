"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "./image-uploader"

export function AddHomeForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
    images: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagesChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, images: urls }))
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/homes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create home")
      }

      const data = await response.json()
      router.push(`/homes/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating home:", error)
      alert("Failed to create home. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Your Home</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Cozy apartment in the heart of the city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your home..."
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Amsterdam, Netherlands"
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="1.5"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per night (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Images (min 3 required)</Label>
                <ImageUploader onChange={handleImagesChange} value={formData.images} maxImages={10} />
              </div>
              {formData.images.length < 3 && <p className="text-sm text-red-500">Please upload at least 3 images</p>}
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step < 3 && (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next
              </Button>
            )}
            {step === 3 && (
              <Button type="submit" disabled={loading || formData.images.length < 3} className="ml-auto">
                {loading ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${step === i ? "bg-primary" : "bg-gray-300"}`} />
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
