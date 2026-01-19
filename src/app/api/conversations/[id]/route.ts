import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { conversationDb, userDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

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

    // Konuşmayı getir
    const conversation = await conversationDb.findById(conversationId);

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Konuşma bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini getir
    const user = await userDb.findById(session.user.id);

    // Mesajları formatla
    const formattedMessages = conversation.messages?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    })) || [];

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        context: conversation.context,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages?.length || 0,
        user: user ? { name: user.name, email: user.email } : null,
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

export async function DELETE(
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

    // Konuşmayı sil
    await conversationDb.delete(conversationId, session.user.id);

    return NextResponse.json({
      message: "Konuşma başarıyla silindi.",
    });

  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Konuşma silinirken hata oluştu." },
      { status: 500 }
    );
  }
}