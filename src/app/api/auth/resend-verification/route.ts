import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Email adresi gereklidir." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul ve yeni token oluştur
    const user = await userDb.regenerateVerificationToken(email);

    // Email gönder
    await sendVerificationEmail(user.email, user.emailVerificationToken!, user.name || user.email);

    return NextResponse.json({
      message: "Doğrulama email'i başarıyla gönderildi. Lütfen email kutunuzu kontrol edin."
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    
    // Güvenlik için: kullanıcı bulunamadı hatası bile genel mesaj göster
    return NextResponse.json(
      { error: error.message || "Doğrulama email'i gönderilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}

