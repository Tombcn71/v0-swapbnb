import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
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
}
