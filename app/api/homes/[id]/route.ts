import { homeLogger } from "@/lib/logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  homeLogger.info(`Ophalen van woning met ID: ${id}`)

  // Rest van de functie blijft hetzelfde...
  return new Response(`Woning ID: ${id}`)
}
