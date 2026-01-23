import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { userDb } from "@/lib/database";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// GET /api/users/me - Get current user information
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Güncel kullanıcı bilgilerini çek
    const currentUser = await userDb.findById(user.id);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini döndür (şifre hariç)
    return NextResponse.json({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
      teamId: currentUser.teamId,
      teamNumber: currentUser.teamNumber,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
    });

  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
