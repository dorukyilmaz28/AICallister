import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      status?: string
      teamId?: string
      teamNumber?: string
      emailVerified?: boolean
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    status?: string
    teamId?: string
    teamNumber?: string
    emailVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    status?: string
    teamId?: string
    teamNumber?: string
    emailVerified?: boolean
  }
}
