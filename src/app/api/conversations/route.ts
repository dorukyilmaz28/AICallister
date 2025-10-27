import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      context: conv.context,
      createdAt: conv.createdAt.toISOString(),
      messageCount: conv.messages.length,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Konuşmalar yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
