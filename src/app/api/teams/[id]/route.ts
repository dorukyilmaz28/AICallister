import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamDb, teamMemberDb, userDb, teamChatDb, teamJoinRequestDb, teamNotificationDb, prisma } from "@/lib/database";

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

// Takıma katılma (şimdilik direkt üye yap)
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

    // Takımın var olduğunu kontrol et
    const team = await teamDb.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Zaten takımda mı?
    const existingMembers = await teamMemberDb.findByTeamId(teamId);
    const existingMember = existingMembers.find((m: TeamMember) => m.userId === session.user.id);

    if (existingMember) {
      return NextResponse.json(
        { message: "Zaten bu takımın üyesisiniz." },
        { status: 200 }
      );
    }

    // Doğrudan üyeliğe ekle
    await teamMemberDb.create({
      userId: session.user.id,
      teamId: teamId,
      role: "member"
    });

    // Bilgilendirici bildirim (opsiyonel)
    await teamNotificationDb.create(
      teamId,
      "member_joined",
      "Yeni Üye Katıldı",
      `Bir kullanıcı takıma katıldı.`,
      session.user.id
    );

    return NextResponse.json({
      message: "Takıma katıldınız.",
    });

  } catch (error) {
    console.error("Error joining team (request flow):", error);
    return NextResponse.json(
      { error: "Katılım isteği gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Takım detaylarını getir
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

    // Takımı getir
    const team = await teamDb.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Takım üyelerini getir
    const members = await teamMemberDb.findByTeamId(teamId);
    const membersWithUsers = await Promise.all(
      members.map(async (member: TeamMember) => {
        // Eğer member.user zaten varsa onu kullan, yoksa userDb'den çek
        let user = (member as any).user;
        if (!user) {
          user = await userDb.findById(member.userId);
        }
        return {
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null
        };
      })
    );

    // Kullanıcının takımda olup olmadığını kontrol et
    const isMember = members.some((m: TeamMember) => m.userId === session.user.id);

    // Takım sohbetlerini getir
    const chats = await teamChatDb.findByTeamId(teamId);

    // Kullanıcının bu takım için bekleyen katılım isteği var mı?
    let pendingJoinRequest = false;
    if (!isMember && session.user.id) {
      const existingPending = await prisma.teamJoinRequest.findFirst({
        where: {
          teamId: teamId,
          userId: session.user.id,
          status: 'pending'
        }
      });
      pendingJoinRequest = !!existingPending;
    }

    return NextResponse.json({
      team: {
        ...team,
        members: membersWithUsers,
        memberCount: members.length,
        isMember,
        pendingJoinRequest,
        chats: chats || []
      }
    });

  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Takım bilgileri yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}