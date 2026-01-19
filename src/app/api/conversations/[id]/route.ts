import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { conversationDb, userDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Konuşmayı getir
    const conversation = await conversationDb.findById(conversationId);

    if (!conversation || conversation.userId !== user.id) {
      return NextResponse.json(
        { error: "Konuşma bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini getir
    const userData = await userDb.findById(user.id);

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
        user: userData ? { name: userData.name, email: userData.email } : null,
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
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Konuşmayı sil
    await conversationDb.delete(conversationId, user.id);

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