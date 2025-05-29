import { SignUp } from "@clerk/nextjs"
import { Navbar } from "@/components/navbar"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12">
        <SignUp />
      </main>
    </div>
  )
}
