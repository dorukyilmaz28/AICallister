import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { userDb } from "@/lib/database";

/**
 * Hem NextAuth session hem de JWT token'dan kullanıcı bilgisini al
 * Bu fonksiyon hem web (NextAuth) hem de mobile (JWT token) desteği sağlar
 */
export async function getAuthUser(req: NextRequest) {
  // Önce NextAuth session'ını kontrol et (web için)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
      teamId: session.user.teamId,
      teamNumber: session.user.teamNumber,
    };
  }

  // NextAuth session yoksa, Authorization header'dan JWT token'ı kontrol et (mobile için)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // "Bearer " kısmını çıkar

    try {
      const secret = process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production";
      const decoded = jwt.verify(token, secret) as {
        id: string;
        email: string;
        role: string;
        status: string;
        iat?: number;
        exp?: number;
      };

      // Token'dan user bilgisini al
      if (decoded.id) {
        // Database'den fresh user bilgisini çek (status güncellemeleri için)
        const user = await userDb.findById(decoded.id);
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            teamId: user.teamId || undefined,
            teamNumber: user.teamNumber || undefined,
          };
        }
      }
    } catch (error) {
      console.error("JWT token verification error:", error);
      // Token geçersiz, null döndür
      return null;
    }
  }

  // Ne session ne de token yoksa null döndür
  return null;
}
