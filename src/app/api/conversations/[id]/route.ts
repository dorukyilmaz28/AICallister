import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Konuşmayı ve mesajlarını getir
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Konuşma bulunamadı." },
        { status: 404 }
      );
    }

    // Mesajları formatla
    const formattedMessages = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        context: conversation.context,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messageCount: conversation.messages.length,
        user: conversation.user,
      },
      messages: formattedMessages,
    });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Konuşma yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
