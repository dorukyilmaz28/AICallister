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
  console.log('[getAuthUser] ========== AUTH CHECK START ==========');
  
  // Önce NextAuth session'ını kontrol et (web için)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    console.log('[getAuthUser] ✅ NextAuth session found:', session.user.id);
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
  console.log('[getAuthUser] ⚠️ NextAuth session not found');

  // NextAuth session yoksa, Authorization header'dan JWT token'ı kontrol et (mobile için)
  const authHeader = req.headers.get("authorization");
  console.log('[getAuthUser] Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('[getAuthUser] Authorization header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'N/A');
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // "Bearer " kısmını çıkar
    console.log('[getAuthUser] ✅ Bearer token found, length:', token.length);

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

      console.log('[getAuthUser] ✅ Token decoded successfully, user ID:', decoded.id);
      console.log('[getAuthUser] Token exp:', decoded.exp);
      console.log('[getAuthUser] Current time:', Math.floor(Date.now() / 1000));

      // Token expire kontrolü
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        console.error('[getAuthUser] ❌ JWT token expired');
        console.error('[getAuthUser] Exp time:', decoded.exp);
        console.error('[getAuthUser] Current time:', Math.floor(Date.now() / 1000));
        return null;
      }

      // Token'dan user bilgisini al
      if (decoded.id) {
        // Database'den fresh user bilgisini çek (status güncellemeleri için)
        const user = await userDb.findById(decoded.id);
        if (user) {
          console.log('[getAuthUser] ✅ User found in database:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            teamId: user.teamId || undefined,
            teamNumber: user.teamNumber || undefined,
          };
        } else {
          console.error('[getAuthUser] ❌ User not found in database for ID:', decoded.id);
        }
      }
    } catch (error: any) {
      console.error('[getAuthUser] ❌ JWT token verification error:', error.message);
      console.error('[getAuthUser] Error details:', error);
      // Token geçersiz, null döndür
      return null;
    }
  } else {
    console.log('[getAuthUser] ⚠️ No Bearer token in Authorization header');
  }

  // Ne session ne de token yoksa null döndür
  console.log('[getAuthUser] ❌ No authentication found');
  console.log('[getAuthUser] ========== AUTH CHECK END ==========');
  return null;
}
