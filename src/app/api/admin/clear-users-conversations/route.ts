import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Admin kontrolü
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Yalnızca admin bu işlemi yapabilir." },
        { status: 403 }
      );
    }

    // Onay kontrolü
    const { confirm } = await req.json().catch(() => ({ confirm: undefined }));
    if (confirm !== "SIL") {
      return NextResponse.json(
        { error: "Onay için body'de { confirm: 'SIL' } göndermelisiniz." },
        { status: 400 }
      );
    }

    // TÜM VERİLERİ SİL - İlk sıfır haline döndür
    // Foreign key constraint'leri dikkate alarak sırayla sil
    
    const deletedMessages = await prisma.message.deleteMany({});
    const deletedConversations = await prisma.conversation.deleteMany({});
    const deletedTeamNotifications = await prisma.teamNotification.deleteMany({});
    const deletedTeamJoinRequests = await prisma.teamJoinRequest.deleteMany({});
    const deletedTeamChats = await prisma.teamChat.deleteMany({});
    const deletedTeamMembers = await prisma.teamMember.deleteMany({});
    
    // Teams'lerin adminId'sini null yap (foreign key constraint'i çözmek için)
    await prisma.team.updateMany({
      data: { adminId: null }
    });
    
    const deletedTeams = await prisma.team.deleteMany({});
    const deletedUsers = await prisma.user.deleteMany({});

    return NextResponse.json({
      message: "TÜM VERİLER SİLİNDİ - Site ilk sıfır haline döndü.",
      deleted: {
        users: deletedUsers.count,
        teams: deletedTeams.count,
        conversations: deletedConversations.count,
        messages: deletedMessages.count,
        teamMembers: deletedTeamMembers.count,
        teamChats: deletedTeamChats.count,
        teamJoinRequests: deletedTeamJoinRequests.count,
        teamNotifications: deletedTeamNotifications.count
      }
    });

  } catch (error: any) {
    console.error("Clear users/conversations error:", error);
    return NextResponse.json(
      { error: error?.message || "Silme işlemi sırasında hata oluştu." },
      { status: 500 }
    );
  }
}

