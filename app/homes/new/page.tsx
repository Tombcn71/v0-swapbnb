import { AddHomeForm } from "@/components/homes/add-home-form"

export default function AddHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Voeg je woning toe</h1>
      <p className="text-gray-600 mb-8">
        Vul de onderstaande gegevens in om je woning toe te voegen aan SwapBnB. Hoe meer details je verstrekt, hoe
        groter de kans dat andere gebruikers geïnteresseerd zijn in een huizenruil.
      </p>
      <AddHomeForm />
    </div>
  )
}
