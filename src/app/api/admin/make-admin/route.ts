import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// Admin yükseltme: body { email }, header: x-admin-secret
export async function POST(req: NextRequest) {
  try {
    // Production'da açıkça izin verilmiş olmalı
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_ACTIONS !== "true") {
      return NextResponse.json({ error: "Bu ortamda işlem devre dışı." }, { status: 403 });
    }

    const headerSecret = req.headers.get("x-admin-secret") || "";
    const expected = process.env.ADMIN_ACTION_SECRET || "";
    if (!expected || headerSecret !== expected) {
      return NextResponse.json({ error: "Geçersiz veya eksik gizli anahtar." }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email zorunludur" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin", status: "approved" }
    });

    return NextResponse.json({
      message: "Kullanıcı admin yapıldı ve onaylandı.",
      user: { id: updated.id, email: updated.email, role: updated.role, status: updated.status }
    });
  } catch (error: any) {
    console.error("make-admin error:", error);
    return NextResponse.json({ error: error?.message || "Hata oluştu" }, { status: 500 });
  }
}


