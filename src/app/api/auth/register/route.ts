import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyTeamNumber } from "@/lib/blueAlliance";

// Prisma client'ı singleton olarak kullan
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    // Database'i initialize et
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database bağlantı hatası" },
        { status: 500 }
      );
    }

    const { name, email, password, teamNumber } = await req.json();

    // Validation
    if (!name || !email || !password || !teamNumber) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Verify team number with Blue Alliance API (optional - don't fail if API is down)
    let teamVerification: { isValid: boolean; team?: any; error?: string } = { isValid: true, team: null, error: undefined };
    try {
      teamVerification = await verifyTeamNumber(teamNumber);
      if (!teamVerification.isValid) {
        console.warn("Team verification failed:", teamVerification.error);
        // Don't fail registration, just warn
      }
    } catch (apiError) {
      console.warn("Blue Alliance API error:", apiError);
      // Continue with registration even if API fails
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        teamNumber,
      },
    });

    // Find or create team
    let team = await prisma.team.findFirst({
      where: { teamNumber },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: teamVerification.team?.nickname || teamVerification.team?.name || `Team ${teamNumber}`,
          teamNumber,
          description: teamVerification.team ? `${teamVerification.team.city}, ${teamVerification.team.state_prov}` : `FRC Team ${teamNumber}`,
        },
      });
    }

    // Add user to team as member
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "member",
      },
    });

    return NextResponse.json(
      { 
        message: "Kullanıcı başarıyla oluşturuldu.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
