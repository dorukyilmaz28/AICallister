import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { userDb } from "@/lib/database"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await userDb.findByEmail(credentials.email)

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          const isPasswordValid = await userDb.verifyPassword(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email)
            return null
          }

          console.log("User authenticated successfully:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            teamId: user.teamId || undefined,
            teamNumber: user.teamNumber || undefined
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // İlk login veya token refresh'te user bilgilerini güncelle
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.teamId = user.teamId
        token.teamNumber = user.teamNumber
      }
      
      // Her token kontrolünde database'den fresh user bilgisi çek
      // Bu sayede onay durumu güncel kalır
      if (token.id) {
        try {
          const freshUser = await userDb.findById(token.id as string)
          if (freshUser) {
            token.status = freshUser.status
            token.role = freshUser.role
            token.teamId = freshUser.teamId
            token.teamNumber = freshUser.teamNumber
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error)
          // Hata durumunda eski token değerleri kullanılır
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.teamId = token.teamId as string
        session.user.teamNumber = token.teamNumber as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Hata durumunda signin sayfasına yönlendir
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Geçici olarak production'da da debug açık
}
