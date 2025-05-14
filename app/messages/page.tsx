import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Berichten</h1>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600 py-8">Je hebt nog geen berichten</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/listings">Zoek woningen om te ruilen</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
