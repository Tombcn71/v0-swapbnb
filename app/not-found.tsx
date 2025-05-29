import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Pagina niet gevonden</h2>
      <p className="mb-6 text-gray-600 max-w-md">De pagina die je zoekt bestaat niet of is verplaatst.</p>
      <Button asChild>
        <Link href="/">Terug naar homepagina</Link>
      </Button>
    </div>
  )
}
