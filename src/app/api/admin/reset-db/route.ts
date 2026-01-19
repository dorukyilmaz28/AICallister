import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import fs from "fs";
import path from "path";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    // Ek güvenlik: production'da açıkça izin verilmiş olmalı
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_RESET !== "true") {
      return NextResponse.json({ error: "Bu ortamda reset devre dışı." }, { status: 403 });
    }

    // Gizli anahtar zorunlu
    const headerSecret = req.headers.get("x-reset-secret") || "";
    const expectedSecret = process.env.RESET_DB_SECRET || "";
    if (!expectedSecret || headerSecret !== expectedSecret) {
      return NextResponse.json({ error: "Geçersiz veya eksik gizli anahtar." }, { status: 403 });
    }

    // Ek onay tokenı
    const { confirm } = await req.json().catch(() => ({ confirm: undefined }));
    if (confirm !== "RESET") {
      return NextResponse.json({ error: "Onay metni hatalı. 'RESET' gönderin." }, { status: 400 });
    }

    // Kullanıcı admin mi? (role: admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Yalnızca admin reset atabilir." }, { status: 403 });
    }

    // Şemayı tamamen düşür + yeniden oluştur
    await prisma.$executeRawUnsafe("DROP SCHEMA IF EXISTS public CASCADE;");
    await prisma.$executeRawUnsafe("CREATE SCHEMA public;");

    // Varsayılan grant'ler (bazı Vercel Postgres kurulumlarında gerekebilir, yoksa sessiz geçer)
    try {
      await prisma.$executeRawUnsafe("GRANT ALL ON SCHEMA public TO public;");
    } catch {}

    // Son migration dosyasını uygula
    const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
    const migrationFolders = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    if (migrationFolders.length === 0) {
      return NextResponse.json({ error: "Migration bulunamadı." }, { status: 500 });
    }

    // Tüm migrationları sırayla uygula (daha güvenli)
    for (const folder of migrationFolders) {
      const sqlPath = path.join(migrationsDir, folder, "migration.sql");
      if (!fs.existsSync(sqlPath)) continue;
      const sql = fs.readFileSync(sqlPath, "utf8");
      if (sql && sql.trim().length > 0) {
        await prisma.$executeRawUnsafe(sql);
      }
    }

    return NextResponse.json({ message: "Veritabanı sıfırlandı ve migrationlar uygulandı." });
  } catch (error: any) {
    console.error("DB reset error:", error);
    return NextResponse.json(
      { error: error?.message || "Veritabanı sıfırlanırken hata oluştu." },
      { status: 500 }
    );
  }
}


