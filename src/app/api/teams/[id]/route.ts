import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamDb, teamMemberDb, userDb, teamChatDb, teamJoinRequestDb, teamNotificationDb, prisma } from "@/lib/database";


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

// Takıma katılma (katılım isteği oluşturur, doğrudan üye yapmaz)
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
    const existingMember = existingMembers.find((m: TeamMember) => m.userId === user.id);

    if (existingMember) {
      return NextResponse.json(
        { message: "Zaten bu takımın üyesisiniz." },
        { status: 200 }
      );
    }

    // Bekleyen istek var mı?
    const pendingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        userId: user.id,
        teamId,
        status: 'pending'
      }
    });

    if (pendingRequest) {
      return NextResponse.json(
        { message: "Zaten bekleyen bir katılım isteğiniz var." },
        { status: 200 }
      );
    }

    // Katılım isteği oluştur
    await prisma.teamJoinRequest.create({
      data: {
        userId: user.id,
        teamId,
        status: 'pending'
      }
    });

    // Bildirim (opsiyonel)
    await teamNotificationDb.create(
      teamId,
      "join_request",
      "Yeni Katılım İsteği",
      "Bir kullanıcı takıma katılmak istiyor.",
      user.id
    );

    return NextResponse.json({
      message: "Katılım isteğiniz gönderildi. Onay bekleniyor.",
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
    const user = await getAuthUser(req);

    if (!user?.id) {
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
    const isMember = members.some((m: TeamMember) => m.userId === user.id);

    // Takım sohbetlerini getir
    const chats = await teamChatDb.findByTeamId(teamId);

    // Kullanıcının bu takım için bekleyen katılım isteği var mı?
    let pendingJoinRequest = false;
    if (!isMember && user.id) {
      const existingPending = await prisma.teamJoinRequest.findFirst({
        where: {
          teamId: teamId,
          userId: user.id,
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