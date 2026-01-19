import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamDb, teamMemberDb, teamChatDb, userDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ChatMessage {
  id: string;
  userId: string;
  teamId: string;
  content: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Takım sohbetine mesaj gönderme
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
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
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some((m: TeamMember) => m.userId === user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    // Mesajı kaydet
    const chatMessage = await teamChatDb.create({
      userId: user.id,
      teamId: teamId,
      content: content.trim()
    });

    // Kullanıcı bilgilerini getir
    const userData = await userDb.findById(user.id);

    return NextResponse.json({
      message: {
        ...chatMessage,
        user: userData ? {
          id: userData.id,
          name: userData.name,
          email: userData.email
        } : null
      }
    });

  } catch (error) {
    console.error("Error sending team message:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Takım sohbetini getir
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;

    // Kullanıcının takımda olup olmadığını kontrol et
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some((m: TeamMember) => m.userId === user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    // Takım sohbetini getir
    const chatMessages = await teamChatDb.findByTeamId(teamId);

    // Her mesaj için kullanıcı bilgilerini getir
    const messagesWithUsers = await Promise.all(
      chatMessages.map(async (message: ChatMessage) => {
        const user = await userDb.findById(message.userId);
        return {
          ...message,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null
        };
      })
    );

    return NextResponse.json({
      messages: messagesWithUsers
    });

  } catch (error) {
    console.error("Error fetching team chat:", error);
    return NextResponse.json(
      { error: "Takım sohbeti yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Mesaj silme veya tüm mesajları temizleme
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;
    const { messageId, clearAll } = await req.json();

    // Kullanıcının takımda olup olmadığını kontrol et
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some((m: TeamMember) => m.userId === user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    if (clearAll) {
      // Tüm mesajları temizle
      await teamChatDb.clearAll(teamId, user.id);
      return NextResponse.json({
        message: "Tüm mesajlar başarıyla silindi."
      });
    } else {
      // Tek mesaj sil
      if (!messageId) {
        return NextResponse.json(
          { error: "Mesaj ID gereklidir." },
          { status: 400 }
        );
      }

      await teamChatDb.delete(messageId, user.id);
      return NextResponse.json({
        message: "Mesaj başarıyla silindi."
      });
    }

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Mesaj silinirken hata oluştu." },
      { status: 500 }
    );
  }
}