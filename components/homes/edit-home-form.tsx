"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Home } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UploadCloud, X } from "lucide-react"
import Image from "next/image"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(5, "Address is required"),
  bedrooms: z.coerce.number().int().min(1, "At least 1 bedroom is required"),
  bathrooms: z.coerce.number().min(0.5, "At least 0.5 bathroom is required"),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest is required"),
})

type FormValues = z.infer<typeof formSchema>

interface EditHomeFormProps {
  home: Home
}

export function EditHomeForm({ home }: EditHomeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [images, setImages] = useState<string[]>(home.images || [])
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: home.title,
      description: home.description,
      address: home.address,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms,
      maxGuests: home.maxGuests,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageFile(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!newImageFile) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", newImageFile)

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
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const addImage = async () => {
    if (!newImageFile) return

    const imageUrl = await uploadImage()
    if (imageUrl) {
      setImages([...images, imageUrl])
      setNewImageFile(null)
      // Reset the file input
      const fileInput = document.getElementById("image-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      // Update home data
      const response = await fetch(`/api/homes/${home.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          images,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update home")
      }

      toast({
        title: "Success",
        description: "Your home has been updated successfully.",
      })

      router.push(`/homes/${home.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating home:", error)
      toast({
        title: "Error",
        description: "Failed to update your home. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Your Property</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Cozy apartment in the city center" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your property..." className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.5" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Guests</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="images" className="pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Property Images</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden h-48">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {images.length === 0 && (
                    <div className="col-span-3 bg-gray-100 rounded-md p-8 text-center">
                      <p className="text-gray-500">No images yet. Add some images to showcase your property.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    <Button onClick={addImage} disabled={!newImageFile || isUploading} className="h-32">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Add Image"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                <Button type="button" onClick={() => setActiveTab("availability")}>
                  Next: Availability
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="pt-4">
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-amber-800 text-sm">
                  You can manage your property's availability after saving the property details. Please save your
                  changes first, then return to the property page to add or edit availability.
                </p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                  Back to Images
                </Button>
                <Button type="button" onClick={() => form.handleSubmit(onSubmit)()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save All Changes
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
