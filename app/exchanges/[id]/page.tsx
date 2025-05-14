import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { ArrowLeft, Calendar, Check, Home, MapPin, MessageSquare, User } from "lucide-react"
import { ExchangeTimeline } from "@/components/exchanges/exchange-timeline"
import { ExchangeActions } from "@/components/exchanges/exchange-actions"
import { ExchangeReview } from "@/components/exchanges/exchange-review"
import type { Exchange } from "@/lib/types"

// Dit zou normaal gesproken uit de database komen
const mockExchange: Exchange = {
  id: "ex2",
  requesterId: "user3",
  requesterName: "Thomas Jansen",
  homeOwnerId: "user1",
  homeOwnerName: "Sophie Visser",
  homeId: "home2",
  homeTitle: "Gezellig Rijtjeshuis in Utrecht",
  homeCity: "Utrecht",
  startDate: "2025-07-10",
  endDate: "2025-07-20",
  status: "accepted",
  createdAt: "2025-05-05T14:30:00Z",
  updatedAt: "2025-05-06T09:15:00Z",
  message: "Hoi Sophie, ik ben op zoek naar een plek in Utrecht voor 10 dagen in juli. Jouw huis lijkt perfect!",
}

export default function ExchangeDetailPage({ params }: { params: { id: string } }) {
  // In een echte applicatie zou je hier de uitwisseling ophalen op basis van het ID
  const exchange = mockExchange

  if (!exchange) {
    notFound()
  }

  const isRequester = true // In een echte applicatie zou dit gebaseerd zijn op de ingelogde gebruiker
  const otherPartyName = isRequester ? exchange.homeOwnerName : exchange.requesterName
  const otherPartyId = isRequester ? exchange.homeOwnerId : exchange.requesterId

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/exchanges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar uitwisselingen
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Uitwisseling details</h1>
          <div className="flex items-center">
            <Badge
              className={`${
                exchange.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : exchange.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : exchange.status === "rejected" || exchange.status === "canceled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
              }`}
            >
              {exchange.status === "pending"
                ? "In afwachting"
                : exchange.status === "accepted"
                  ? "Geaccepteerd"
                  : exchange.status === "rejected"
                    ? "Afgewezen"
                    : exchange.status === "canceled"
                      ? "Geannuleerd"
                      : "Voltooid"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/messages/${otherPartyId}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Bericht {otherPartyName}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/homes/${exchange.homeId}`}>
              <Home className="mr-2 h-4 w-4" />
              Bekijk woning
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-48 w-full md:w-64 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={`/abstract-geometric-shapes.png?height=400&width=600&query=${exchange.homeTitle}`}
                    alt={exchange.homeTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <h2 className="text-xl font-semibold mb-2">{exchange.homeTitle}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{exchange.homeCity}</span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium">Verblijfsperiode</p>
                        <p className="text-gray-600">
                          {format(new Date(exchange.startDate), "d MMMM yyyy", { locale: nl })} -{" "}
                          {format(new Date(exchange.endDate), "d MMMM yyyy", { locale: nl })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium">Uitwisseling met</p>
                        <p className="text-gray-600">{otherPartyName}</p>
                      </div>
                    </div>
                  </div>

                  {exchange.message && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 italic">"{exchange.message}"</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline" className="mb-8">
            <TabsList>
              <TabsTrigger value="timeline">Tijdlijn</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              {exchange.status === "completed" && <TabsTrigger value="review">Beoordeling</TabsTrigger>}
            </TabsList>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6">
                  <ExchangeTimeline exchange={exchange} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Uitwisselingsdetails</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Aanvraagdatum</p>
                          <p>{format(new Date(exchange.createdAt), "d MMMM yyyy", { locale: nl })}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Laatste update</p>
                          <p>{format(new Date(exchange.updatedAt), "d MMMM yyyy", { locale: nl })}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Aanvrager</p>
                          <p>{exchange.requesterName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Eigenaar</p>
                          <p>{exchange.homeOwnerName}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Checklist</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">Uitwisseling aangevraagd</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(exchange.createdAt), "d MMMM yyyy", { locale: nl })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">Uitwisseling geaccepteerd</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(exchange.updatedAt), "d MMMM yyyy", { locale: nl })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            {exchange.status === "completed" ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">Uitwisseling voltooid</p>
                            {exchange.status === "completed" ? (
                              <p className="text-sm text-gray-600">
                                {format(new Date(exchange.endDate), "d MMMM yyyy", { locale: nl })}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600">Nog niet voltooid</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {exchange.status === "completed" && (
              <TabsContent value="review">
                <Card>
                  <CardContent className="p-6">
                    <ExchangeReview exchangeId={exchange.id} homeId={exchange.homeId} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent>
              <ExchangeActions exchange={exchange} isRequester={isRequester} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hulp nodig?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Heb je vragen over deze uitwisseling of heb je hulp nodig? Bekijk onze veelgestelde vragen of neem
                  contact op met onze klantenservice.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/faq">Veelgestelde vragen</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/contact">Contact opnemen</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
