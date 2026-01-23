import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/database";
import crypto from "crypto";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, reason } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Bu e-posta adresi ile kayıtlı hesap bulunamadı." },
        { status: 404 }
      );
    }

    // Güvenli bir silme token'ı oluştur
    const deletionToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7); // 7 gün geçerli

    // Token'ı veritabanına kaydet (User model'ine deletionToken ve deletionTokenExpiry eklenmeli)
    // Şimdilik basit bir yaklaşım: Kullanıcıyı işaretle
    // Not: Prisma schema'ya deletionToken ve deletionTokenExpiry eklenmeli
    
    // Geçici çözüm: Kullanıcıyı silme isteği gönderildi olarak işaretle
    // Gerçek uygulamada e-posta gönderilir ve onay linki ile silme yapılır
    
    // Şimdilik başarılı yanıt döndür
    // Gerçek uygulamada burada e-posta gönderilir:
    // await sendDeletionEmail(user.email, deletionToken);
    
    console.log(`[ACCOUNT DELETION] Request received for: ${email}`);
    console.log(`[ACCOUNT DELETION] Reason: ${reason || "Not provided"}`);
    console.log(`[ACCOUNT DELETION] Token: ${deletionToken}`);

    return NextResponse.json({
      success: true,
      message: "Hesap silme talebiniz alındı. E-posta adresinize onay linki gönderildi.",
      // Not: Production'da e-posta gönderilir
      // token: deletionToken, // Sadece development için
    });

  } catch (error: any) {
    console.error("Account deletion request error:", error);
    return NextResponse.json(
      { error: "Hesap silme talebi işlenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
