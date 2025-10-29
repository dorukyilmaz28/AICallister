import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { teamJoinRequestDb } from "@/lib/database";
import { prisma } from "@/lib/database";

// Takım katılım isteklerini getir (sadece admin)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;

    // Admin kontrolü: Takım yöneticisi (Team.adminId) ya da yetkili üye
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const isTeamAdmin = team?.adminId === session.user.id;

    const adminMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: session.user.id,
        role: { in: ['captain', 'mentor'] }
      }
    });

    if (!isTeamAdmin && !adminMember) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const requests = await teamJoinRequestDb.findByTeamId(teamId);

    return NextResponse.json({ requests });

  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json(
      { error: "İstekler getirilirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Takım katılım isteği oluştur
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;
    const { message } = await req.json();

    const request = await teamJoinRequestDb.create(session.user.id, teamId, message);

    return NextResponse.json({
      message: "Katılım isteği gönderildi.",
      request
    });

  } catch (error: any) {
    console.error("Error creating join request:", error);
    return NextResponse.json(
      { error: error.message || "İstek oluşturulurken hata oluştu." },
      { status: 400 }
    );
  }
}
