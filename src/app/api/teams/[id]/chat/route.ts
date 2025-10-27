import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamDb, teamMemberDb, teamChatDb, userDb } from "@/lib/database";

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
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some(m => m.userId === session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    // Mesajı kaydet
    const chatMessage = await teamChatDb.create({
      userId: session.user.id,
      teamId: teamId,
      content: content.trim()
    });

    // Kullanıcı bilgilerini getir
    const user = await userDb.findById(session.user.id);

    return NextResponse.json({
      message: {
        ...chatMessage,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;

    // Kullanıcının takımda olup olmadığını kontrol et
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some(m => m.userId === session.user.id);

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
      chatMessages.map(async (message) => {
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