import { format } from "date-fns"
import { nl } from "date-fns/locale"
import type { Exchange } from "@/lib/types"

interface ExchangeTimelineProps {
  exchange: Exchange
}

export function ExchangeTimeline({ exchange }: ExchangeTimelineProps) {
  // Genereer tijdlijn events op basis van de uitwisselingsstatus
  const timelineEvents = [
    {
      date: new Date(exchange.createdAt),
      title: "Uitwisseling aangevraagd",
      description: `${exchange.requesterName} heeft een aanvraag ingediend om te verblijven in ${exchange.homeTitle}.`,
    },
  ]

  if (exchange.status !== "pending") {
    timelineEvents.push({
      date: new Date(exchange.updatedAt),
      title:
        exchange.status === "accepted"
          ? "Uitwisseling geaccepteerd"
          : exchange.status === "rejected"
            ? "Uitwisseling afgewezen"
            : "Uitwisseling geannuleerd",
      description:
        exchange.status === "accepted"
          ? `${exchange.homeOwnerName} heeft de uitwisselingsaanvraag geaccepteerd.`
          : exchange.status === "rejected"
            ? `${exchange.homeOwnerName} heeft de uitwisselingsaanvraag afgewezen.`
            : `De uitwisselingsaanvraag is geannuleerd.`,
    })
  }

  if (exchange.status === "accepted") {
    timelineEvents.push({
      date: new Date(exchange.startDate),
      title: "Verblijf start",
      description: `Begin van het verblijf in ${exchange.homeCity}.`,
      upcoming: new Date(exchange.startDate) > new Date(),
    })

    timelineEvents.push({
      date: new Date(exchange.endDate),
      title: "Verblijf eindigt",
      description: `Einde van het verblijf in ${exchange.homeCity}.`,
      upcoming: new Date(exchange.endDate) > new Date(),
    })
  }

  if (exchange.status === "completed") {
    timelineEvents.push({
      date: new Date(exchange.updatedAt), // In een echte applicatie zou dit de datum zijn waarop de uitwisseling is voltooid
      title: "Uitwisseling voltooid",
      description: "De uitwisseling is succesvol afgerond.",
    })
  }

  // Sorteer events op datum
  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      <div className="space-y-8">
        {timelineEvents.map((event, index) => (
          <div key={index} className="relative pl-10">
            <div
              className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${
                event.upcoming ? "bg-gray-200" : "bg-teal-500 text-white"
              }`}
            >
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-1">{format(event.date, "d MMMM yyyy", { locale: nl })}</p>
              <p className="text-gray-600">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
