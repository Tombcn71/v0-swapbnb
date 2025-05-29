import { SignIn } from "@clerk/nextjs"
import { Navbar } from "@/components/navbar"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12">
        <SignIn />
      </main>
    </div>
  )
}
