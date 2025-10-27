import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Takıma katılma
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

    // Takımın var olduğunu kontrol et
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının zaten takımda olup olmadığını kontrol et
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: teamId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Zaten bu takımın üyesisiniz." },
        { status: 400 }
      );
    }

    // Takıma katıl
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        teamId: teamId,
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: true,
      },
    });

    return NextResponse.json({
      teamMember,
      message: "Takıma başarıyla katıldınız.",
    });

  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { error: "Takıma katılırken hata oluştu." },
      { status: 500 }
    );
  }
}

// Takım detaylarını getir
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

    // Kullanıcının takımda olup olmadığını kontrol et
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: teamId,
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    // Takım detaylarını getir
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        chats: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Son 50 mesaj
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      team,
      userRole: teamMember.role,
    });

  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Takım detayları yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
