import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "ADMIN" | "MANAGER" | "SALESPERSON"
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "ADMIN" | "MANAGER" | "SALESPERSON"
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "ADMIN" | "MANAGER" | "SALESPERSON"
  }
}
