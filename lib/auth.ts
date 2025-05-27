import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { executeQuery } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Zoek de gebruiker op basis van e-mail EN haal profile_image op
          const users = await executeQuery(
            "SELECT id, name, email, password_hash, profile_image FROM users WHERE email = $1",
            [credentials.email],
          )

          if (users.length === 0) {
            console.log("Gebruiker niet gevonden:", credentials.email)
            return null
          }

          const user = users[0]

          // Controleer of het wachtwoord overeenkomt
          const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash)
          if (!passwordMatch) {
            console.log("Wachtwoord komt niet overeen voor:", credentials.email)
            return null
          }

          // Geef de gebruikersgegevens terug MET profile_image
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profile_image || null, // Gebruik profile_image als image
          }
        } catch (error) {
          console.error("Fout bij autorisatie:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dagen
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image // profile_image wordt hier opgeslagen
      }

      // Refresh profile_image bij elke JWT call
      if (token.email) {
        try {
          const users = await executeQuery("SELECT profile_image FROM users WHERE email = $1", [token.email])
          if (users.length > 0) {
            token.picture = users[0].profile_image || null
          }
        } catch (error) {
          console.error("Fout bij ophalen profile_image:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string | null // profile_image komt hier terecht
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
