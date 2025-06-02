import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welkom bij SwapBnB</h1>
          <p className="text-gray-600 mt-2">Maak je account aan en verifieer je identiteit</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
