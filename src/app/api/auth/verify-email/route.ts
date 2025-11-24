import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Doğrulama token'ı bulunamadı." },
        { status: 400 }
      );
    }

    const user = await userDb.verifyEmail(token);

    // Başarılı doğrulama sonrası kullanıcıyı login sayfasına yönlendir
    return NextResponse.redirect(
      new URL(`/auth/signin?verified=true&email=${encodeURIComponent(user.email)}`, req.url)
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    
    // Hata durumunda signin sayfasına hata mesajı ile yönlendir
    const errorMessage = encodeURIComponent(error.message || "Doğrulama sırasında bir hata oluştu.");
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${errorMessage}`, req.url)
    );
  }
}

