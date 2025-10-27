import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamDb, teamMemberDb, userDb } from "@/lib/database";

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: string;
}

// Takıma katılma
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

    // Kullanıcının zaten takımda olup olmadığını kontrol et
    const existingMembers = await teamMemberDb.findByTeamId(teamId);
    const existingMember = existingMembers.find((m: TeamMember) => m.userId === session.user.id);

    if (existingMember) {
      return NextResponse.json(
        { error: "Zaten bu takımın üyesisiniz." },
        { status: 400 }
      );
    }

    // Takıma katıl
    await teamMemberDb.create({
      userId: session.user.id,
      teamId: teamId,
      role: "member"
    });

    return NextResponse.json({
      message: "Takıma başarıyla katıldınız.",
    });

  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { error: "Takıma katılırken hata oluştu." },
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
        const user = await userDb.findById(member.userId);
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

    return NextResponse.json({
      team: {
        ...team,
        members: membersWithUsers,
        memberCount: members.length,
        isMember
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