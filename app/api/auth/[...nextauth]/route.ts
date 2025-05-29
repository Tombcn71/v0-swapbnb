import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Keeping credentials as a fallback
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a simple demo, in a real app you would:
        // 1. Validate credentials against your database
        // 2. Return user data if valid

        // For demo purposes, we'll accept any credentials
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            name: "Demo User",
            email: credentials.email,
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ""
      }
      return session
    },
  },
  // Add debug mode temporarily to get more detailed logs
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
