import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExchangeList } from "@/components/exchanges/exchange-list"

export default function ExchangesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Mijn Uitwisselingen</h1>
      <p className="text-gray-600 mb-6">Beheer al je huizenruil aanvragen en reserveringen op één plek.</p>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="incoming">Ontvangen aanvragen</TabsTrigger>
          <TabsTrigger value="outgoing">Verzonden aanvragen</TabsTrigger>
          <TabsTrigger value="upcoming">Aankomende uitwisselingen</TabsTrigger>
          <TabsTrigger value="past">Eerdere uitwisselingen</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <ExchangeList type="incoming" />
        </TabsContent>
        <TabsContent value="outgoing">
          <ExchangeList type="outgoing" />
        </TabsContent>
        <TabsContent value="upcoming">
          <ExchangeList type="upcoming" />
        </TabsContent>
        <TabsContent value="past">
          <ExchangeList type="past" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
