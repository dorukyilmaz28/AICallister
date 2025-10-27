import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { conversationDb } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const conversations = await conversationDb.findByUserId(session.user.id);

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      context: conv.context,
      createdAt: conv.createdAt,
      messageCount: conv.messages?.length || 0,
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
