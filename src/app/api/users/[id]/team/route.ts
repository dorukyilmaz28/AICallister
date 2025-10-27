import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Kullanıcının kendi bilgilerini sorguladığını kontrol et
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    // Kullanıcının takımını bul
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
      },
      include: {
        team: true,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Kullanıcı hiçbir takımda değil." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      teamId: teamMember.team.id,
      teamName: teamMember.team.name,
      teamNumber: teamMember.team.teamNumber,
      userRole: teamMember.role,
    });

  } catch (error) {
    console.error("Error fetching user team:", error);
    return NextResponse.json(
      { error: "Takım bilgisi alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
