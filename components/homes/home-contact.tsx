"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"

const formSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: "Selecteer een aankomstdatum.",
    }),
    to: z.date({
      required_error: "Selecteer een vertrekdatum.",
    }),
  }),
  guests: z.coerce.number().min(1, "Minimaal 1 gast.").max(20, "Maximaal 20 gasten."),
  message: z
    .string()
    .min(10, "Bericht moet minimaal 10 karakters bevatten.")
    .max(500, "Bericht mag maximaal 500 karakters bevatten."),
})

interface HomeContactProps {
  homeId: string
  ownerId: string
  onSuccess?: () => void
}

export function HomeContact({ homeId, ownerId, onSuccess }: HomeContactProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: 1,
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      toast({
        title: "Je moet ingelogd zijn",
        description: "Log in of registreer om contact op te nemen met de eigenaar.",
        variant: "destructive",
      })
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.href))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: ownerId,
          content: `Hallo! Ik ben geïnteresseerd in je woning en zou graag willen verblijven van ${values.dateRange.from.toLocaleDateString("nl-NL")} tot ${values.dateRange.to.toLocaleDateString("nl-NL")} met ${values.guests} ${values.guests === 1 ? "gast" : "gasten"}.\n\n${values.message}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Bericht verzonden!",
        description:
          "Je bericht is succesvol verzonden naar de eigenaar. Je kunt de conversatie volgen in je berichten.",
      })

      form.reset()
      setDateRange(undefined)

      // Optioneel: redirect naar berichten pagina
      setTimeout(() => {
        router.push("/messages")
      }, 2000)

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van je bericht. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Aankomst en vertrek</FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    dateRange={dateRange}
                    setDateRange={(range) => {
                      setDateRange(range)
                      field.onChange(range)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aantal gasten</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={20} {...field} />
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
                  <Textarea
                    placeholder="Stel je voor en vertel waarom je geïnteresseerd bent in deze woning..."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verzenden...
            </>
          ) : (
            "Verstuur bericht naar eigenaar"
          )}
        </Button>
      </form>
    </Form>
  )
}
