import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamDb, teamMemberDb, userDb } from "@/lib/database";

// Takım oluşturma
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { name, description, teamNumber } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Takım adı gereklidir." },
        { status: 400 }
      );
    }

    // Takım oluştur
    const team = await teamDb.create({
      name,
      description,
      teamNumber
    });

    // Takım oluşturan kişiyi kaptan olarak ekle
    await teamMemberDb.create({
      userId: session.user.id,
      teamId: team.id,
      role: "captain"
    });

    return NextResponse.json({
      team,
      message: "Takım başarıyla oluşturuldu.",
    });

  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Takım oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

// Kullanıcının takımlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Kullanıcının üye olduğu takımları bul
    const userMemberships = await teamMemberDb.findByUserId(session.user.id);
    const teamIds = userMemberships.map(m => m.teamId);
    
    // Tüm takımları getir ve filtrele
    const allTeams = await teamDb.getAll();
    const userTeams = allTeams.filter(team => teamIds.includes(team.id));

    // Her takım için üye sayısını hesapla
    const teamsWithCounts = await Promise.all(
      userTeams.map(async (team) => {
        const members = await teamMemberDb.findByTeamId(team.id);
        return {
          ...team,
          members: members.map(async (member) => {
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
          }),
          _count: {
            members: members.length,
            chats: 0 // Team chat sayısını hesaplamak için ayrı fonksiyon gerekebilir
          }
        };
      })
    );

    return NextResponse.json({
      teams: teamsWithCounts,
    });

  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Takımlar yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
