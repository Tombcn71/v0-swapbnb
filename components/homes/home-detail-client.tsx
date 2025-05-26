"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  homeId: string
  ownerId: string
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minimaal 2 karakters bevatten.",
  }),
  email: z.string().email({
    message: "Vul een geldig e-mailadres in.",
  }),
  message: z.string().min(10, {
    message: "Bericht moet minimaal 10 karakters bevatten.",
  }),
})

export function HomeDetailClient({ homeId, ownerId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isOwner, setIsOwner] = useState(session?.user.id === ownerId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          homeId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Bericht verzonden!",
          description: "Je bericht is succesvol verzonden naar de eigenaar.",
        })
        form.reset()
      } else {
        toast({
          title: "Er is iets misgegaan.",
          description: "Probeer het later nog eens.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Er is iets misgegaan.",
        description: "Probeer het later nog eens.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3">{/* Content of the home detail */}</div>

      {/* Contact Form */}
      <div className="lg:col-span-1">
        {!isOwner && session && (
          <Card>
            <CardHeader>
              <CardTitle>Geïnteresseerd in deze woning?</CardTitle>
              <p className="text-sm text-muted-foreground">Geïnteresseerd in een huizenruil?</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Naam</FormLabel>
                        <FormControl>
                          <Input placeholder="Naam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bericht</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Stel je vraag of doe een voorstel..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Verstuur bericht
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {!session && (
          <Card>
            <CardHeader>
              <CardTitle>Geïnteresseerd in deze woning?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">
                Log in om contact op te nemen met de eigenaar en een swap aan te vragen.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 hover:bg-blue-700">
                Inloggen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
