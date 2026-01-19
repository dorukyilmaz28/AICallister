import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { conversationDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  context: string;
  messages?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const conversations = await conversationDb.findByUserId(user.id);

    const formattedConversations = conversations.map((conv: Conversation) => ({
      id: conv.id,
      title: conv.title || 'Başlıksız Konuşma',
      context: conv.context,
      createdAt: conv.createdAt.toISOString(),
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
