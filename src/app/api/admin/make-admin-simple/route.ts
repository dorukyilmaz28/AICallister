import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// BASİT VERSİYON: Gizli anahtar olmadan, sadece email ile
// Sadece development için veya güvenlik önemli değilse kullanılabilir
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email gereklidir. Body'de { email: 'yilmaz.doruk28@gmail.com' } gönderin." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Bu email ile kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Admin yap ve onayla
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "admin",
        status: "approved"
      }
    });

    return NextResponse.json({
      message: "✅ Başarılı! Hesabınız admin yapıldı.",
      user: {
        email: updated.email,
        name: updated.name,
        role: updated.role,
        status: updated.status
      }
    });

  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { error: error?.message || "Bir hata oluştu." },
      { status: 500 }
    );
  }
}

