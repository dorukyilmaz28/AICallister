import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Takım sohbetine mesaj gönderme
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
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Mesaj içeriği gereklidir." },
        { status: 400 }
      );
    }

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

    // Mesajı kaydet
    const teamChat = await prisma.teamChat.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        teamId: teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: teamChat,
    });

  } catch (error) {
    console.error("Error sending team message:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Takım sohbet geçmişini getir
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

    // Sohbet geçmişini getir
    const messages = await prisma.teamChat.findMany({
      where: {
        teamId: teamId,
      },
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
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      messages,
    });

  } catch (error) {
    console.error("Error fetching team messages:", error);
    return NextResponse.json(
      { error: "Sohbet geçmişi yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
